import React, { useState } from "react";
import {
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ColumnTitleEditor = ({ title, color, onTitleChange, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  const showEditModal = () => {
    form.setFieldsValue({ title });
    setIsEditModalOpen(true);
  };

  const handleEditOk = () => {
    form.validateFields().then((values) => {
      onTitleChange(values.title);
      setIsEditModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Text strong className="text-base flex-1">
          {title}
        </Text>
        <div className="flex items-center gap-1">
          <Tooltip title="编辑列名">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color }} />}
              onClick={showEditModal}
              className="hover:bg-white/50 !px-2"
            />
          </Tooltip>
          <Tooltip title="删除此列">
            <Popconfirm
              title="删除确认"
              description={
                <div className="flex flex-col gap-2">
                  <Text>确定要删除此列吗？</Text>
                  <Text type="secondary">
                    该列中的所有任务都将被删除，此操作不可恢复。
                  </Text>
                </div>
              }
              icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}
              onConfirm={onDelete}
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="hover:bg-red-50 !px-2"
              />
            </Popconfirm>
          </Tooltip>
        </div>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>编辑列名</span>
          </div>
        }
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalOpen(false)}
        okText="保存"
        cancelText="取消"
        className="!w-[400px]"
        maskClosable={false}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ title }}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="列名称"
            rules={[
              { required: true, message: "请输入列名称！" },
              { max: 10, message: "列名称不能超过10个字符！" },
            ]}
          >
            <Input placeholder="请输入列名称" maxLength={10} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ColumnTitleEditor;
