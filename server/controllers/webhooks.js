import { Webhook } from "svix";
import User from "../models/User.js";  // Ensure .js extension is included

export const clerkWebhooks = async (req, res) => {
    try {
        // Create a Svix instance with Clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        // Extracting data from request body
        const { data, type } = req.body;
        
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,  
                    email: data.email_address[0]?.email_address || "",
                    name: `${data.first_name} ${data.last_name}`.trim(),
                    image: data.image_url || "",
                    resume: " "
                };

                await User.create(userData);
                return res.json({ success: true, message: "User created" });
            }
            case 'user.updated': {
                const userData = {
                    email: data.email_address[0]?.email_address || "",
                    name: `${data.first_name} ${data.last_name}`.trim(),
                    image: data.image_url || "",
                };

                await User.findByIdAndUpdate(data.id, userData);
                return res.json({ success: true, message: "User updated" });
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.json({ success: true, message: "User deleted" });
            }
            default:
                return res.json({ success: false, message: "Unknown event type" });
        }
    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).json({ success: false, message: 'Webhooks Error', error: error.message });
    }
};
