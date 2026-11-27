/* 
The seller application approval flow goes tom the button to the API Route(this file) to the service,
then back to the page with the saved application.
*/

import NextAuth from "next-auth";
import { authOptions } from "@/auth";
import { approveSellerApplication } from "@/server/services/sellerApplication.service";
import { handleApiError } from "@/server/utils/handleApiError";

const { auth } = NextAuth(authOptions);

/**
 * This route reads the user session and checks that the user is an "ADMIN".
 * It takes the ID from the URL, calls approveSellerApplication(id),
 * and sends the saved application back to the page. 
 */

export async function POST(_request, { params }) {
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
                { error: { message: "Satıcılık başvurularını sadece yöneticiler onaylayabilir."} },
                { status: 403 },
            );
        }
        /**
         * Application needs only the application ID from the URL.
         * Return just 'application' so the response excludes the full user record returned internally by the service.
         * which can contain the password hash.
         */

        const { id } = await params;
        const { application } = await approveSellerApplication(id);

        return Response.json({ success: true, application });
    } catch (error) {
        return handleApiError(error);
    }
}