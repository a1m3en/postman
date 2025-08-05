import { Router,Request,Response } from "express";
import axios, { AxiosRequestConfig } from "axios";
export const testRoutes = Router();

testRoutes.post('/send', async (req: Request, res: Response) => {
  const { url, method, headers, body } = req.body;

  try {
    const start = Date.now();

    if (!url || !method) {
      return res.status(400).json({ error: 'URL and method are required' });
    }
    const response = await axios.request({
      method,
      url,
      headers: headers as AxiosRequestConfig['headers'],
      data: body,
      validateStatus: () => true 
    });

    const time = Date.now() - start;

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      time: `${time}ms`
    });

  } catch (error: any) {
    res.status(500).json({
      error: true,
      message: error.message || 'Request failed',
      stack: error.stack
    });
  }
});