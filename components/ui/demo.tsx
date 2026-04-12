"use client";

import React from "react";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Dropdown, Space } from "antd";

const items: MenuProps["items"] = [
  {
    label: "ไทย",
    key: "0",
  },
];

const Demo: React.FC = () => (
  <Dropdown menu={{ items }} trigger={["click"]}>
    <a onClick={(e) => e.preventDefault()}>
      <Space>
        EN
        <DownOutlined />
      </Space>
    </a>
  </Dropdown>
);

export default Demo;
