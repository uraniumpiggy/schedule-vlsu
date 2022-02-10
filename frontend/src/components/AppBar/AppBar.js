import React from 'react';
import './AppBar.css';
import MenuButton from './AppBarMenu/MenuButton'

export default function AppBar() {
    return (
        <div className="appbar-container">
            <MenuButton />
        </div>
    );
}
