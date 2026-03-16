import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      attending,
      events,
      fun,
      wishes,
    } = body;

    // Validate required fields
    if (!name || !attending) {
      return NextResponse.json(
        { error: "Missing required fields: name and attending status" },
        { status: 400 }
      );
    }

    // Get email from environment
    const recipientEmail = process.env.RSVP_EMAIL_ADDRESS || "udhay.meenal.wedding@gmail.com";

    // Format the events array
    const eventsText = Array.isArray(events) && events.length > 0 
      ? events.join(", ") 
      : "None selected";

    // Format the fun array
    const funText = Array.isArray(fun) && fun.length > 0 
      ? fun.join(", ") 
      : "None selected";

    // Send email to organizer
    await resend.emails.send({
      from: "Wedding RSVP <onboarding@resend.dev>",
      to: recipientEmail,
      subject: `New RSVP: ${name} - ${attending}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #c9a15d 0%, #b8860b 100%); color: white; padding: 20px; border-radius: 8px; }
              .content { padding: 20px 0; }
              .field { margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-left: 4px solid #c9a15d; }
              .label { font-weight: bold; color: #5a3020; }
              .value { color: #666; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New RSVP Submission</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Name:</div>
                  <div class="value">${escapeHtml(name)}</div>
                </div>
                <div class="field">
                  <div class="label">Will attend:</div>
                  <div class="value">${escapeHtml(attending)}</div>
                </div>
                <div class="field">
                  <div class="label">Events interested in:</div>
                  <div class="value">${escapeHtml(eventsText)}</div>
                </div>
                <div class="field">
                  <div class="label">Most excited about:</div>
                  <div class="value">${escapeHtml(funText)}</div>
                </div>
                ${wishes ? `
                <div class="field">
                  <div class="label">Wishes for the couple:</div>
                  <div class="value">${escapeHtml(wishes)}</div>
                </div>
                ` : ""}
              </div>
            </div>
          </body>
        </html>
      `,
    });

    // Send confirmation email (copy) to organizer inbox
    await resend.emails.send({
      from: "Udhay & Meenal <onboarding@resend.dev>",
      to: recipientEmail,
      subject: "RSVP Received - Udhay & Meenal's Wedding Celebration",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Playfair Display', Arial, sans-serif; line-height: 1.8; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #c9a15d 0%, #b8860b 100%); color: white; padding: 40px 20px; border-radius: 8px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { padding: 30px 20px; background: #faf8f3; border-radius: 8px; margin-top: 20px; }
              .details { background: white; padding: 20px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #c9a15d; }
              .detail-row { margin-bottom: 15px; }
              .detail-label { font-weight: bold; color: #5a3020; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
              .detail-value { color: #666; margin-top: 4px; }
              .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ RSVP Received ✨</h1>
              </div>
              <div class="content">
                <p>Hi <strong>${escapeHtml(name)}</strong>,</p>
                <p>Thank you so much for confirming your attendance! We're thrilled to celebrate this special occasion with you.</p>
                
                <div class="details">
                  <div class="detail-row">
                    <div class="detail-label">Attendance Status</div>
                    <div class="detail-value">${escapeHtml(attending)}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Events You Plan to Attend</div>
                    <div class="detail-value">${eventsText}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Most Excited About</div>
                    <div class="detail-value">${funText}</div>
                  </div>
                  ${wishes ? `
                  <div class="detail-row">
                    <div class="detail-label">Your Wishes for Us</div>
                    <div class="detail-value">${escapeHtml(wishes)}</div>
                  </div>
                  ` : ""}
                </div>
                
                <p style="margin-top: 20px;">We're looking forward to creating wonderful memories together on April 18-19, 2026 in Amritsar.</p>
                <p>If you have any questions or need to make changes, please don't hesitate to reach out.</p>
                <p>With love and joy,<br/><strong>Udhay & Meenal</strong></p>
              </div>
              <div class="footer">
                <p>📍 Amritsar | 📅 April 18-19, 2026</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      { success: true, message: "RSVP submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("RSVP API error:", error);
    return NextResponse.json(
      { error: "Failed to submit RSVP. Please try again later." },
      { status: 500 }
    );
  }
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
