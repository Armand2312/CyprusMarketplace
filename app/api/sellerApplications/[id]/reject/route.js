import NextAuth from "next-auth";
import { authOptions } from "@/auth";
import { ValidationError } from "@/server/errors/ValidationError";
import { handleApiError } from "@/server/utils/handleApiError";
import { rejectSellerApplication } from "@/server/services/sellerApplication.service";

const { auth } = NextAuth(authOptions);

export async function POST(request, { params }) {
    /**
     * This rejection route uses 'await auth()' to read the session associated with the incoming request.
     * With no session, it returns 401. 
     * With a signed-in user whose role isn't 'ADMIN', it returns '403'.
     * This check belongs on the server because someone can call the API directly without clicking the button.
     */
    try {
        const session = await auth(); 

        if(!session?.user) { 
            return Response.json(
                { error: { message: " Satıcılık başvurularını görebilmek için ilk önce giriş yapınız."} },
                { status: 401 },
            );
        }

        if(session.user.role !== "ADMIN") {
            return Response.json(
                { error: { message: "Satıcılık başvurularını sadece yöneticiler reddedebilir."} },
                { status: 403 },
            );
        }

        const body = await request.json().catch(() => { // Reads the reason from the body.
            throw new ValidationError("Request body must be valid JSON.")
        });

        const { id } = await params; // gives you the ID from the '[id]'
        const application = await rejectSellerApplication(id, body?.rejectionReason); // The optional chaining syntax lets the service handle a missing reason through its existing validation.

        return Response.json( { success: true, application});
    } catch(error) {
        // If the server throws a known error, 'handleApiError' converts it to an HTTP response the page can display.
        return handleApiError(error);
    }
}