import React, { useState } from "react";
import { Layout, Menu, Button, Typography, Modal, Form, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import logo from "../assets/favicon.svg";
import EventType from "../types/event";

const { Sider } = Layout;
const { Title } = Typography;

const EventBar = ({ events, setEvents, currentEvent, setCurrentEvent }) => {
  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAdd = (values) => {
    const title = values.title;
    if (
      events.find((event) => event.title.toLowerCase() === title.toLowerCase())
    ) {
      Modal.error({
        title: "添加失败",
        content: "事件名称已存在！",
      });
      return;
    }

    setEvents((prev) => [
      ...prev,
      {
        title,
        columnColors: {
          "To do": "#faad14",
          "In progress": "#1677ff",
          Completed: "#52c41a",
        },
        history: [
          {
            type: EventType.CREATEEVENT,
            date: new Date().getTime(),
            desc: `创建事件-${title}`,
            details: `创建事件-${title}`,
            user: null,
          },
        ],
        ["To do"]: [],
        ["In progress"]: [],
        ["Completed"]: [],
      },
    ]);
    setIsAddModalOpen(false);
    form.resetFields();
  };

  return (
    <Sider width={250} className="!bg-white !p-4 border-r h-full">
      <div className="flex flex-col gap-4">
        <Title level={3} className="!mb-0 flex items-center gap-2">
          <img src={logo} alt="logo" className="w-8 h-8" />
          .kanBan
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          block
          size="large"
        >
          新建事件
        </Button>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[currentEvent.title]}
        items={events.map((item) => ({
          key: item.title,
          label: item.title,
          onClick: () => setCurrentEvent(item),
        }))}
        className="!border-0 !mt-4"
      />

      <Modal
        title="新建事件"
        open={isAddModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="title"
            label="事件名称"
            rules={[{ required: true, message: "请输入事件名称！" }]}
          >
            <Input placeholder="请输入事件名称" />
          </Form.Item>
        </Form>
      </Modal>
    </Sider>
  );
};

export default EventBar;
