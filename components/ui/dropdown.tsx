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

const LanguageDropdown: React.FC = () => (
  <Dropdown menu={{ items }} trigger={["click"]}>
    <a
      onClick={(e) => e.preventDefault()}
      className="inline-flex items-center rounded-md border border-[#d4d4d4] px-2.5 py-1.5 text-xs font-medium text-[#1a1a1a] transition-all hover:border-[#1a1a1a] cursor-pointer"
    >
      <Space>
        EN
        <DownOutlined style={{ fontSize: 10 }} />
      </Space>
    </a>
  </Dropdown>
);

export default LanguageDropdown;
