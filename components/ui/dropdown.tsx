"use client";

import React from "react";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Dropdown, Space } from "antd";
import { useLanguage, type Language } from "@/lib/i18n";

const LanguageDropdown: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const items: MenuProps["items"] = [
    { label: "English", key: "en" },
    { label: "ไทย", key: "th" },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    setLanguage(key as Language);
  };

  return (
    <Dropdown
      menu={{ items, onClick, selectedKeys: [language] }}
      trigger={["click"]}
    >
      <a
        onClick={(e) => e.preventDefault()}
        className="inline-flex items-center rounded-md border border-[#d4d4d4] px-2.5 py-1.5 text-xs font-medium text-[#1a1a1a] transition-all hover:border-[#1a1a1a] cursor-pointer"
      >
        <Space>
          {t.languageLabel}
          <DownOutlined style={{ fontSize: 10 }} />
        </Space>
      </a>
    </Dropdown>
  );
};

export default LanguageDropdown;
