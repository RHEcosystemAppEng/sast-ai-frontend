import React from 'react';
import { Nav, NavList, NavItem } from '@patternfly/react-core';
import { NavLink } from 'react-router-dom';

const SidebarNavigation: React.FC = () => {
  return (
    <Nav aria-label="Navigation">
      <NavList>
        <NavItem>
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'pf-m-current' : ''}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Dashboard
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            to="/packages"
            className={({ isActive }) => isActive ? 'pf-m-current' : ''}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Monitored Packages
          </NavLink>
        </NavItem>
        {/* Future navigation items can be added here */}
      </NavList>
    </Nav>
  );
};

export default SidebarNavigation;
