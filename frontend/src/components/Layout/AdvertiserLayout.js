import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AdvertiserLayout = () => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar role="ADVERTISER" />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar role="ADVERTISER" />
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdvertiserLayout;
