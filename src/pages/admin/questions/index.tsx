// pages/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout"; // 确保路径正确
import {
  EditableProTable,
  ProCard,
  ProFormField,
  ProFormRadio,
} from "@ant-design/pro-components";
import { Button, message, Modal, Form } from "antd";

const HomePage: React.FC = () => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource]: any = useState([]);
  //模态框是否打开
  const [modalVisible, setModalVisible] = useState(false);
  //编辑选项的题目
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  const columns: any = [
    {
      title: "编号",
      dataIndex: "id",
      tooltip: "编号",
      formItemProps: (form: any, { rowIndex }: any) => {
        return {
          rules: [{ required: true, message: "此项为必填项" }],
        };
      },
      editable: (text: any, record: any, index: number) => false,
      width: "10%",
    },
    {
      title: "咨询单问题",
      dataIndex: "question_text",
      tooltip: "咨询单问题",
      formItemProps: (form: any, { rowIndex }: any) => {
        return {
          rules: [{ required: true, message: "此项为必填项" }],
        };
      },
      width: "40%",
    },
    {
      title: "题目类型",
      key: "type",
      dataIndex: "type",
      valueType: "select",
      valueEnum: {
        input: { text: "输入", status: "Default" },
        radio: { text: "单选", status: "Error" },
        checkbox: { text: "多选", status: "Success" },
      },
    },
    {
      title: "是否必填",
      key: "is_required",
      dataIndex: "is_required",
      valueType: "select",
      valueEnum: {
        "1": { text: "是", status: "Default" },
        "0": { text: "否", status: "Error" },
      },
    },
    //排序
    {
      title: "排序",
      key: "sort",
      dataIndex: "sort",
      valueType: "number",
      formItemProps: (form: any, { rowIndex }: any) => {
        return {
          rules:
            //必须是数字
            [
              { required: true, message: "此项为必填项" },
              {
                pattern: /^\d+$/,
                message: "请输入数字",
              },
            ],
        };
      },
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      render: (
        text: any,
        record: any,
        _: any,
        action: { startEditable: (arg0: any) => void }
      ) => [
        <a key="editable" onClick={() => action?.startEditable?.(record.id)}>
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            const res = await axios.delete(
              `/api/delquestion?id=${record.id}`
            );
            if (res.data.code !== 200) {
              message.error("删除失败");
              return;
            }
            setDataSource(
              dataSource.filter(
                (item: { id: React.Key }) => item.id !== record.id
              )
            );
            message.success("删除成功");
          }}
        >
          删除
        </a>,
        //如果类型不是input,加一个编辑选项<a>标签
        record.type !== "input" && (
          <a
            key="editOptions"
            onClick={() => {
              //打开模态框
              setModalVisible(true);
              const question = dataSource.find(
                (item: { id: React.Key }) => item.id === record.id
              );
              console.log(question);
              setSelectedQuestion(question);
            }}
          >
            编辑选项
          </a>
        ),
      ],
    },
  ];

  const optionColunbs: any = [
    {
      title: "选项编号",
      dataIndex: "id",
      tooltip: "编号",
      formItemProps: (form: any, { rowIndex }: any) => {
        return {
          rules: [{ required: true, message: "此项为必填项" }],
        };
      },
      editable: (text: any, record: any, index: number) => false,
    },
    //简称
    {
      title: "简称",
      dataIndex: "option_value",
      tooltip: "简称",
      formItemProps: (form: any, { rowIndex }: any) => {
        return {
          rules: [{ required: true, message: "此项为必填项" }],
        };
      },
    },
    {
      title: "选项内容",
      dataIndex: "option_label",
      tooltip: "选项内容",
      formItemProps: (form: any, { rowIndex }: any) => {
        return {
          rules: [{ required: true, message: "此项为必填项" }],
        };
      },
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      render: (
        text: any,
        record: any,
        _: any,
        action: { startEditable: (arg0: any) => void }
      ) => [
        <a key="editable" onClick={() => action?.startEditable?.(record.id)}>
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            //发起delete 请求
            const res = await axios.delete(
              `/api/deloption?optionId=${record.id}`
            );
            if (res.data.code !== 200) {
              message.error("删除失败");
              return;
            }
            // selectedQuestion?.options
            const options = selectedQuestion?.options.filter(
              (item: { id: React.Key }) => item.id !== record.id
            );
            setSelectedQuestion({
              ...selectedQuestion,
              options,
            });
            //也更新 dataSource
            setDataSource(
              dataSource.map((item: any) => {
                if (item.id === selectedQuestion?.id) {
                  return {
                    ...item,
                    options,
                  };
                }
                return item;
              })
            );
            message.success("删除成功");
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <Layout>
      <EditableProTable<any>
        rowKey="id"
        headerTitle="咨询单题目设置"
        maxLength={5}
        scroll={{ x: 960 }}
        recordCreatorProps={false}
        loading={false}
        toolBarRender={() => [
          <Button
            key="render"
            type="primary"
            onClick={() => {
              // defaultData 最大id+1
              const maxId = dataSource.reduce(
                (max: number, item: { id: number }) => Math.max(max, item.id),
                0
              );
              setDataSource([
                {
                  id: maxId + 1,
                },
                ...dataSource,
              ]);
            }}
          >
            新建
          </Button>,
        ]}
        columns={columns}
        request={async () => ({
          data: (await axios.get("/api/getquestion")).data[0].questions,
          total: 3,
          success: true,
        })}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: "multiple",
          editableKeys,
          onSave: async (rowKey, data, row) => {
            console.log(rowKey, data, row);
            //判断是不是所有编号都唯一
            const idSet = new Set();
            dataSource.forEach((item: { id: number }) => {
              if (idSet.has(item.id)) {
                message.error(`编号${item.id}重复，请重新输入`);
                return;
              }
              idSet.add(item.id);
            });
            const res = await axios.post("/api/savequestion", {
              data: data,
            });
            if (res.data.code === 200) {
              message.success("保存成功");
            } else {
              message.error("保存失败");
            }
          },
          onChange: setEditableRowKeys,
        }}
      />
      <Modal
        width={800}
        title={`编辑选项`}
        open={modalVisible}
        onOk={() => {}}
        onCancel={() => {
          setModalVisible(false);
        }}
        destroyOnClose
      >
        <EditableProTable
          columns={optionColunbs}
          rowKey="id"
          value={selectedQuestion?.options}
          onChange={(value) => {
            console.log(value);
            setSelectedQuestion({
              ...selectedQuestion,
              options: value,
            });
          }}
          recordCreatorProps={{
            position: "top",
            // 每次新增的时候需要Key
            record: () => {
              const maxOptionId = dataSource
                .flatMap((question: { options: any }) => question.options || []) // 将 options 扁平化，过滤 null
                .reduce(
                  (maxId: number, option: { id: number }) =>
                    Math.max(maxId, option.id),
                  -Infinity
                ); // 找到最大 id
              return {
                id: maxOptionId + 1,
              };
            },
          }}
          editable={{
            type: "multiple",
            editableKeys,
            onSave: async (rowKey, data, row) => {
              console.log("opthons==>", rowKey, data, row);
              //判断是不是所有编号都唯一
              const res = await axios.post("/api/saveoption", {
                data: { ...data, question_id: selectedQuestion?.id },
              });
              if (res.data.code === 200) {
                message.success("保存成功");
                //更新dataSource
                setDataSource(
                  dataSource.map((item: any) => {
                    if (item.id === selectedQuestion?.id) {
                      return {
                        ...item,
                        options: data,
                      };
                    }
                    return item;
                  })
                );
              } else {
                message.error("保存失败");
              }
            },
            onChange: setEditableRowKeys,
          }}
        />
      </Modal>
    </Layout>
  );
};

export default HomePage;
