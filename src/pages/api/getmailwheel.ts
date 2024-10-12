// pages/api/results.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../db'; // 导入配置好的 Knex 实例

// 定义返回数据的接口
interface Result {
  id: number;
  response_id: number;
  module_name: string;
  dimension_name: string;
  average_score: number;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { responseId } = req.query;

      let query = db<Result>('results');

      // 如果传递了 responseId，过滤结果
      if (responseId) {
        const parsedResponseId = parseInt(responseId as string, 10);
        if (!isNaN(parsedResponseId)) {
          query = query.where('response_id', parsedResponseId);
        } else {
          return res.status(400).json({ error: 'Invalid responseId' });
        }
      }

      // 执行查询
      const results = await query.select('*');

      return res.status(200).json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching results:', error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    // 处理非 GET 请求
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
