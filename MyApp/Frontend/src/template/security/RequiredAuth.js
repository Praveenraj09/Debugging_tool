import React, { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { toRelativeUrl } from '@okta/okta-auth-js';
import { Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { Layout } from 'antd';
import SideMenu from './SideMenu';

const { Header, Footer, Sider, Content } = Layout;

function RequiredAuth() {
  const { oktaAuth, authState } = useOktaAuth();

  useEffect(() => {
    if (!authState) {
      return;
    }

    if (!authState?.isAuthenticated) {
      const originalUri = toRelativeUrl(window.location.href, window.location.origin);
      oktaAuth.setOriginalUri(originalUri);
      oktaAuth.signInWithRedirect();
    }
  }, [oktaAuth, !!authState, authState?.isAuthenticated]);

  if (!authState || !authState?.isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }} >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ height: "100vh" }} >
      
        <Content style={{ margin: '2px' }}>
          <Outlet />
        </Content>
      
    </Layout>
  );

}

export default RequiredAuth;