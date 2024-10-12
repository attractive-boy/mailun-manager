// components/Layout.tsx
import React, { useEffect, useState } from 'react';
import {
  GithubFilled,
  InfoCircleFilled,
  PlusCircleFilled,
  QuestionCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, ProLayout } from '@ant-design/pro-components';
import { Button, Input } from 'antd';
import { useRouter } from 'next/router';
import defaultProps from './_defaultProps';

interface LayoutProps {
  children: React.ReactNode; // 定义 children 的类型
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = router.pathname;

  const [isMounted, setIsMounted] = useState(false); // 控制组件是否已挂载

  useEffect(() => {
    // 组件挂载后设置状态
    setIsMounted(true);
  }, []);

  return (
    <ProLayout
      title="脉轮"
      splitMenus
      token={{
        colorBgAppListIconHover: 'rgba(0,0,0,0.06)',
        colorTextAppListIconHover: 'rgba(255,255,255,0.95)',
        // ... 省略其它 token 设置
      }}
      {...defaultProps}
      location={{ pathname }}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        size: 'small',
        title: '七妮妮',
      }}
      actionsRender={(props:any) => {
        if (props.isMobile) return [];
        return [
          props.layout !== 'side' ? (
            <div
              key="SearchOutlined"
              aria-hidden
              style={{ display: 'flex', alignItems: 'center', marginInlineEnd: 24 }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {/* <Input
                style={{
                  borderRadius: 4,
                  marginInlineEnd: 12,
                  backgroundColor: 'rgba(0,0,0,0.03)',
                }}
                prefix={
                  <SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.15)' }} />
                }
                placeholder="搜索方案"
                variant="borderless"
              />
              <PlusCircleFilled style={{ color: 'var(--ant-primary-color)', fontSize: 24 }} /> */}
            </div>
          ) : undefined,
          <InfoCircleFilled key="InfoCircleFilled" />,
          <QuestionCircleFilled key="QuestionCircleFilled" />,
          <GithubFilled key="GithubFilled" />,
        ];
      }}
      menuFooterRender={(props: any) => {
        if (props?.collapsed) return undefined;
        return (
          <p style={{ textAlign: 'center', paddingBlockStart: 12 }}>
            Power by Ant Design
          </p>
        );
      }}
      onMenuHeaderClick={(e: any) => console.log(e)}
      menuItemRender={(item: any, dom: any) => (
        <a onClick={() => router.push(item.path || '/welcome')}>
          {dom}
        </a>
      )}
      layout="top"
      pageTitleRender={false}
    >
      {isMounted && ( // 只在客户端渲染子组件
        <PageContainer
          extra={[
            // <Button key="3">操作</Button>,
            // <Button key="2">操作</Button>,
            // <Button key="1" type="primary">主操作</Button>,
          ]}
          footer={[
            // <Button key="3">重置</Button>,
            // <Button key="2" type="primary">提交</Button>,
          ]}
        >
          <ProCard style={{ height: '200vh', minHeight: 800 }}>
            {children} {/* 渲染子组件 */}
          </ProCard>
        </PageContainer>
      )}
    </ProLayout>
  );
};

export default Layout;
