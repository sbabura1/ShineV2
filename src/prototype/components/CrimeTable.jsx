import React from "react";
import { crimeData } from "../data";

export default function CrimeTable({ interactive }) {
    return React.createElement("div", { className: "data-wrap" },
        React.createElement("table", null,
            React.createElement("thead", null,
                React.createElement("tr", null,
                    React.createElement("th", null, "Incident"),
                    React.createElement("th", null, "District"),
                    React.createElement("th", null, "Type"),
                    React.createElement("th", null, "Calls"),
                    React.createElement("th", null, "Arrests"),
                    React.createElement("th", null, "Population"),
                    React.createElement("th", null, "Calls / 1,000"))),
            React.createElement("tbody", null, crimeData.map((r, i) => React.createElement("tr", { key: i },
                React.createElement("td", { className: interactive && r.issue === "duplicate" ? "warncell" : "" }, r.incident),
                React.createElement("td", null, r.district),
                React.createElement("td", { className: interactive && r.issue === "category" ? "warncell" : "" }, r.type),
                React.createElement("td", { className: interactive && r.issue === "outlier" ? "badcell" : "" }, r.calls),
                React.createElement("td", { className: interactive && r.issue === "missing" ? "badcell" : "" }, r.arrests),
                React.createElement("td", null, r.pop.toLocaleString()),
                React.createElement("td", null, r.rate))))));
}
