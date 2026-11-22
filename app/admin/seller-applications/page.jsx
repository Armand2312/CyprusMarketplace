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

  if (loading) { 
    return <p>Loading seller applications...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

return (
  <main>
    <h1>Seller Applications</h1>

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
              <td>
                {new Date(application.createdAt).toLocaleDateString()}
              </td>

              <td>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApplicationId(application.id); // Her satır kendi 'application.id' değerini taşıdığı için hangi başvurunun deçildiğini state'e koyuyoruz.
                    setRejectionReason("");
                    setMessage("");
                  }}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {selectedApplicationId && ( // Seçilen application için form göster: (Buradaki mantık: Eğer 'selectedApplicationId' truthy ise formu göster.)
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (rejectionReason.trim().length === 0) {
            setMessage("Rejection reason is required.");
            return;
          }

          setMessage(
            `Application ${selectedApplicationId} would be rejected for: ${rejectionReason.trim()}`
          );
        }}
      >
        <h2>Reject Seller Application</h2>

        <label htmlFor="rejectionReason">
          Rejection Reason
        </label>

        <textarea
          id="rejectionReason"
          value={rejectionReason}
          onChange={(event) =>
            setRejectionReason(event.target.value)
          }
        />

        <button type="submit">
          Confirm Reject
        </button>

        <button
          type="button" // Neden Cancel butonu type="button"? Çünkü Form içindeki button'ların varsayılan davranışı submit olabilir.
          onClick={() => {
            setSelectedApplicationId(null);
            setRejectionReason("");
            setMessage("");
          }}
        >
          Cancel
        </button>

        {message && <p>{message}</p>}
      </form>
    )}
  </main>
);
}