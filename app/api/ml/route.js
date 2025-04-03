export async function POST(request) {
    try {
      const data = await request.json();
      
      // Get ML service URL from environment variable or use localhost for development
      const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
      
      // Call your Python service
      const response = await fetch(`${mlServiceUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: data.message }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ML service error: ${errorText}`);
      }
      
      const result = await response.json();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("ML API error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }