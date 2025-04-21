import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { orderId, deliveryDate } = await request.json();
    
    // WhatsApp API credentials
    const phoneNumberId = '397181706805750';
    const accessToken = 'EAAWTW97aiyEBO2ZCbzb5a334Bxk6SjdVfVkZBVlONACbrZCtbde0wlINpT4UKbideBYZCrViXykKAMsD5QQFYst6RJWMp2hmfjU8wUWj5V2nDS0WRK2ZC1gybXop6WHLG72Dd2QlBsRCYX9m8oQgI6scQ2WcRkzi8WD1hWheaBl8OKWTe9IPsn8yNXeGZBvRTZA75KAFi4dY27vqCEwCTB0VIKxBBMZD';
    const recipientPhone = '918928236833';
    
    // Prepare the request body using the confirmation template with variables
    const requestBody = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "template",
      template: {
        "namespace": "shoes",
        "name": "confirmation",
        "language": {
          "code": "en_US"
        },
        "components": [
          {
            "type": "body",
            parameters: [
              { type: "text", text: "Order ID" },
              { type: "text", text: orderId },
              { type: "text", text: deliveryDate }
            ]
          }
        ]
      }
    };
    
    
    // Send the request to Facebook Graph API
    const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API error:', responseData);
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: responseData },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true, data: responseData });
    
  } catch (error) {
    console.error('Error in send-whatsapp API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 