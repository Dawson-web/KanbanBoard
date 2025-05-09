import { Input, Row, Col, Button, Space, Select, Tag, DatePicker } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Card } from "antd";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const FilterMenu = ({
  searchText,
  setSearchText,
  priorityFilter,
  setPriorityFilter,
  dueDateOption,
  setDueDateOption,
  dateRangeFilter,
  setDateRangeFilter,
  isFilterVisible,
  setIsFilterVisible,
  hasActiveFilters,
  clearAllFilters,
}) => {
  return (
    <Card className="mb-8  rounded-md shadow-sm border border-gray-100">
      <div className="p-3 border-b border-gray-50">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索任务..."
              allowClear
              enterButton
              size="middle"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
              className="max-w-md"
            />
          </Col>
          <Col>
            <Space>
              {hasActiveFilters && (
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-red-500 hover:bg-gray-50"
                >
                  清除筛选
                </Button>
              )}
              <Button
                type={isFilterVisible ? "primary" : "default"}
                icon={<FilterOutlined />}
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                ghost={isFilterVisible}
              >
                筛选
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {isFilterVisible && (
        <div className="p-6  rounded-b-md">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <div className="text-sm text-gray-500 mb-1.5">优先级</div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="选择优先级"
                value={priorityFilter}
                onChange={setPriorityFilter}
                maxTagCount={3}
                className="w-full"
                size="middle"
                optionLabelProp="label"
              >
                <Option value="high" label="高优先级">
                  <Tag color="#f5222d">高优先级</Tag>
                </Option>
                <Option value="medium" label="中优先级">
                  <Tag color="#faad14">中优先级</Tag>
                </Option>
                <Option value="low" label="低优先级">
                  <Tag color="#52c41a">低优先级</Tag>
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-sm text-gray-500 mb-1.5">截止日期</div>
              <Select
                style={{ width: "100%" }}
                placeholder="选择截止日期范围"
                value={dueDateOption}
                onChange={setDueDateOption}
                className="w-full"
                size="middle"
              >
                <Option value="all">全部任务</Option>
                <Option value="today">今天</Option>
                <Option value="week">本周内</Option>
                <Option value="overdue">已逾期</Option>
                <Option value="none">无截止日期</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-sm text-gray-500 mb-1.5">自定义日期范围</div>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRangeFilter}
                onChange={setDateRangeFilter}
                className="w-full"
                size="middle"
                placeholder={["开始日期", "结束日期"]}
              />
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
};

export default FilterMenu;
