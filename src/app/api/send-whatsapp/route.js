import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { orderId, deliveryDate } = await request.json();
    
    // WhatsApp API credentials
    const phoneNumberId = '397181706805750';
    const accessToken = 'EAAWTW97aiyEBO4DIM6ErRZCqdzX4p91ogwZCPSFmsBeUYcfZAzCZAtXio8mgqGYnek9z0ftqEDo7I93SjCaZCDF3la29cnWbHifPF0DKzNizrtZCM19pLfXMcFgZBIrzLna2tgaNZB0NmA0pQgnsylBvHGDmxrAecbs2KGQdZAeyZA9giA4QQAvNFcgTMgwE6IRbqG85ZB9qZCunPWq118xyvcP66NhXtlcZD';
    const recipientPhone = '919820313746';
    
    // Prepare the request body
    const requestBody = {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "template",
      template: {
        name: "shoe_confirmation",
        language: {
          code: "en_US"
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "1", text: orderId },
              { type: "2", text: deliveryDate }
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