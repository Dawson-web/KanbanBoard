import React, { useState } from "react";
import { Layout, Menu, Button, Typography, Modal, Form, Input } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import logo from "../assets/favicon.svg";
import EventType from "../types/event";
import { useCallback } from "react";

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

  const handleRemove = useCallback(() => {
    Modal.confirm({
      title: "删除确认",
      content: "确定要删除这个事件吗？此操作不可恢复。",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        // 在删除前添加历史记录
        const eventToDelete = currentEvent.title;

        // update events
        setEvents((prev) => {
          const result = prev.filter(
            (item) => item.title != currentEvent.title
          );
          // if event is empty
          if (!result.length) {
            // init the event
            const initEvent = [
              {
                title: "新建事件",
                columnColors: {
                  "To do": "#faad14",
                  "In progress": "#1677ff",
                  Completed: "#52c41a",
                },
                history: [
                  {
                    type: EventType.CREATEEVENT,
                    date: new Date().getTime(),
                    desc: "创建事件-新建事件",
                    details: "创建事件-新建事件",
                    user: null,
                  },
                ],
                ["To do"]: [],
                ["In progress"]: [],
                ["Completed"]: [],
              },
            ];
            setEvents(initEvent);
          } else {
            // 在第一个事件中添加删除记录
            result[0].history.push({
              type: EventType.DELETEEVENT,
              date: new Date().getTime(),
              desc: `删除事件-${eventToDelete}`,
              details: `删除事件-${eventToDelete}`,
              user: null,
            });
            // set the first event as current
            setCurrentEvent(result[0]);
          }
          return result;
        });
      },
    });
  }, [events, setEvents, currentEvent, setCurrentEvent]);

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
          label: (
            <div className="flex items-center justify-between group">
              <span>{item.title}</span>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="opacity-0 group-hover:opacity-100 transition-opacity !ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentEvent(item);
                  handleRemove();
                }}
              />
            </div>
          ),
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
