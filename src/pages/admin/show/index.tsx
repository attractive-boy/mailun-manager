'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Typography } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import request from 'umi-request';
import { useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const { Text } = Typography;

interface MailWheelData {
  module_name: string;
  dimension_name: string;
  average_score: number;
}

const HomePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [columns, setColumns] = useState<ProColumns[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState<MailWheelData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const questionsResponse = await request.get('/api/getquestion');
        const questions = questionsResponse[0]?.questions || [];

        const dbColumns = questions.map((col: any) => ({
          title: col.question_text,
          dataIndex: `q${col.id}`,
          key: `q${col.id}`,
          ellipsis: true,
          valueType: 'text',
          hideInSearch: true,
        }));

        const newColumns: ProColumns[] = [
          {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
          },
          ...dbColumns,
          {
            title: '创建时间',
            key: 'showTime',
            dataIndex: 'created_at',
            valueType: 'date',
            hideInSearch: true,
          },
          {
            title: '创建时间',
            dataIndex: 'created_at',
            valueType: 'dateRange',
            hideInTable: true,
            search: {
              transform: (value: any[]) => ({
                startTime: value[0],
                endTime: value[1],
              }),
            },
          },
          {
            title: '操作',
            valueType: 'option',
            key: 'option',
            render: (text, record) => [
              <a
                key="viewChart"
                onClick={async () => {
                  setChartLoading(true);
                  setChartError(null);
                  try {
                    const response = await request.get('/api/getmailwheel', {
                      params: { responseId: record.id },
                    });
                    if (response.success) {
                      // 将数据源设置为接收到的数据
                      setDataSource(response.data);
                      setModalVisible(true);
                    } else {
                      setChartError(response.error || '获取脉轮图数据失败');
                    }
                  } catch (error) {
                    setChartError('获取脉轮图数据失败');
                  } finally {
                    setChartLoading(false);
                  }
                }}
              >
                查看脉轮图
              </a>,
            ],
          },
        ];

        setColumns(newColumns);
      } catch (error) {
        console.error('Error fetching columns:', error);
      }
    };

    fetchColumns();
  }, []);

  // 按模块分组数据
  const groupDataByModule = (data: MailWheelData[]) => {
    const groupedData: Record<string, MailWheelData[]> = {};
    data.forEach((item) => {
      if (!groupedData[item.module_name]) {
        groupedData[item.module_name] = [];
      }
      groupedData[item.module_name].push({
        module_name: item.module_name,
        dimension_name: item.dimension_name,
        average_score: item.average_score,
      });
    });
    return groupedData;
  };

  return (
    <Layout>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        scroll={{ x: 'max-content' }}
        request={async (params) => {
          const response = await request.get('/api/getqustionarie', {
            params,
          });
          return {
            data: response.data,
            success: response.success,
            total: response.total,
          };
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'pro-table-single-demos',
          persistenceType: 'localStorage',
          defaultValue: {
            option: { fixed: 'right', disable: true },
          },
          onChange(value) {
            console.log('Columns State Changed:', value);
          },
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        form={{
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        pagination={{
          pageSize: 5,
          onChange: (page) => console.log('Page Changed:', page),
        }}
        dateFormatter="string"
        headerTitle="用户咨询单"
      />
      <Modal
        width={800}
        title="脉轮图"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        destroyOnClose
      >
        {chartLoading ? (
          <Text>加载中...</Text>
        ) : chartError ? (
          <Text style={{ color: 'red' }}>{chartError}</Text>
        ) : dataSource && dataSource.length > 0 ? (
          Object.entries(groupDataByModule(dataSource)).map(([module, data]) => (
            <div key={module} style={{ marginBottom: '20px',display:'inline-block',width:'50%' }}>
              <h3>{module}</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={data}
                  margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dimension_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average_score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))
        ) : (
          <Text>没有脉轮图数据可显示。</Text>
        )}
      </Modal>
    </Layout>
  );
};

export default HomePage;
