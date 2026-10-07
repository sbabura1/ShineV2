import React from 'react';
import { LogOut } from 'lucide-react';

export default function Topbar({ identity, onHome, onLogout }) {
    return React.createElement("div", { className: "topbar" },
        React.createElement("div", { className: "brand", onClick: onHome, style: { cursor: "pointer" } },
            React.createElement("div", { className: "planet-mark" }),
            React.createElement("div", null,
                React.createElement("div", { className: "brand-title" }, "SCALARIS"),
                React.createElement("div", { className: "brand-sub" }, "The Nexus"))),
        React.createElement("div", { className: "profile-pill" },
            React.createElement("div", { className: "avatar-mini" }, identity.avatar),
            React.createElement("div", { className: "nameblock" },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, identity.name),
                React.createElement("div", { className: "level" }, "Nexus Level 7 \u2022 620 Reputation")),
            onLogout && React.createElement("button", {
                type: "button",
                className: "profile-logout-button",
                onClick: onLogout,
                title: "Log out",
                "aria-label": "Log out"
            }, React.createElement(LogOut, { size: 18, "aria-hidden": true }))));
}
