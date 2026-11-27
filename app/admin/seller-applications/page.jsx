// Bu component, browser tarafında çalışabilen bir Client Component'tır.
// Next.js App Router'da component'ler default olarak Server Component'tır.
// 'use client' ekleyerek bu dosyanın client-side React özelliklerini kullanabileceğini söylüyoruz.
"use client";

import { useEffect, useState } from "react";
import { getSellerApplications } from "@/lib/api/getSellerApplications";

export default function SellerApplicationsPage() {
  // Array Destructuring: [mevcut değer, değeri değiştiren fonksiyon]
  const [applications, setApplications] = useState([]); // başlangıçta applications = []
  const [loading, setLoading] = useState(true); // başlangıçta loading = true
  const [error, setError] = useState(null); // başlangıçta error = null

  const [selectedApplicationId, setSelectedApplicationId] = useState(null); // Hangi başvuruyu reddetmek istediğimizi tutar.
  const [rejectionReason, setRejectionReason] = useState(""); // textarea içeriğini tutar.
  const [message, setMessage] = useState(""); // submit sonrası geçici sonucu gösterir.

  const [isRejecting, setIsRejecting] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  // 'useEffect()' React'e kabaca Component render edildikten sonra belirli bir yan işlem gerçekleştir diyor.
  // Bu durumda Backend'den Seller Applications verilerini getir demektir.
  useEffect(() => {
    async function loadApplications() {
      // Başarılıysa veri state' konuyor.
      try {
        // getSellerApplications() backend'e HTTP Request gönderdiği için bir side effect'tir. Bu yüzden useEffect(..) içerisindedir.
        const data = await getSellerApplications(); // Bu helper'ın arkasında GET /api/sellerApplications request'i bulunuyor.
        setApplications(data);
      } catch (error) {
        setError("Seller applications could not be loaded.");
      } finally {
        // Ne olursa olsun finally çalışıyor çünkü request artık tamamlandı.
        setLoading(false);
      }
    }

    loadApplications();
  }, []); // The Dependency Array ([]) is the optional second argument passed to the 'useEffect' hook that controls exactly when the effect's code should execute.
  // By specifying a dependency array, you tell React to track those specific values and only re-run the effect if at least one of them changes between renders.
  // passing an empty arrays tells React that it only runs once, right after the initial render(when the component 'mounts'). This approach is ideal for initial API data fetching.

  async function handleReject(event) {
    event.preventDefault();

    if (isRejecting) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      setMessage("Rejection reason is required.");
      return;
    }

    setIsRejecting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/sellerApplications/${encodeURIComponent(selectedApplicationId)}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejectionReason: reason }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message ?? "Başvuru reddedilemedi.");
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === result.application.id
            ? result.application
            : application,
        ),
      );

      setSelectedApplicationId(null);
      setRejectionReason("");
      setMessage("Seller application rejected");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsRejecting(false);
    }
  }

  /** Explanation of the approve button and it's implementation here in this file.
   * 
   *  The "Approve" button sends a POST request with the application ID in the URL.
   *  While the requests runs, the page disables the review buttons.
   *  On success, it replaces the row with the saved application so you see "APPROVED" immediately.
   * 
   */

  async function handleApprove(applicationId) {
    if(approvingId || isRejecting || selectedApplicationId) return;

    setApprovingId(applicationId);
    setMessage("");

    try {
      const response = await fetch(`/api/sellerApplications/${encodeURIComponent(applicationId)}/approve`,
        { method: "POST" },
      );

      const result = await response.json().catch(() => null);

      if(!response.ok || !result?.application) {
        throw new Error(result?.error?.message ?? "The application could not be approved.");
      }

      setApplications((current) => 
        current.map((application) => 
        application.id === applicationId ? result.application : application,
        ),
      );

      setMessage("Seller application approved.");

    } catch(error) {
      setMessage(error.message);
    } finally {
      setApprovingId(null);
    }
  }

  if (loading) {
    return <p>Loading seller applications...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Seller Applications</h1>
      {message && <p role="status">{message}</p>}

      {applications.length === 0 ? (
        <p>No seller applications found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Business</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{application.businessName}</td>
                <td>{application.businessEmail}</td>
                <td>{application.status}</td>
                <td>{new Date(application.createdAt).toLocaleDateString()}</td>

                <td>
                  <button
                    disabled={Boolean(approvingId) || isRejecting || application.status !== "PENDING"} 
                    type="button"
                    onClick={() => {
                      setSelectedApplicationId(application.id); // Her satır kendi 'application.id' değerini taşıdığı için hangi başvurunun deçildiğini state'e koyuyoruz.
                      setRejectionReason("");
                      setMessage("");
                    }}
                  >
                    Reject
                  </button>

                  <button
                      type="button"
                      disabled={
                        Boolean(approvingId || selectedApplicationId) || 
                        isRejecting ||
                        application.status !== "PENDING"
                      }
                      onClick={() => handleApprove(application.id)}
                  >
                    {approvingId === application.id ? "Approving.." : "Approve"}
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedApplicationId && ( // Seçilen application için form göster: (Buradaki mantık: Eğer 'selectedApplicationId' truthy ise formu göster.)
        <form onSubmit={handleReject}>
          <h2>Reject Seller Application</h2>

          <label htmlFor="rejectionReason">Rejection Reason</label>

          <textarea
            disabled={isRejecting}
            id="rejectionReason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />

          <button type="submit" disabled={isRejecting}>
            {isRejecting ? "Rejecting…" : "Confirm Reject"}
          </button>

          <button
            disabled={isRejecting}
            type="button" // Neden Cancel butonu type="button"? Çünkü Form içindeki button'ların varsayılan davranışı submit olabilir.
            onClick={() => {
              setSelectedApplicationId(null);
              setRejectionReason("");
              setMessage("");
            }}
          >
            Cancel
          </button>

        </form>   
      )}
      {message && <p>{message}</p>}
    </main>
  );
}
