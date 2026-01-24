import React from "react";

const FilterPill = ({
    label,
    avatarUrl,
    active,
    onClick,
}: {
    label: string;
    avatarUrl?: string;
    active: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            onClick={onClick}
            style={{
                ...filterPillBtn,
                borderColor: active ? "#2563eb" : "#e5e7eb", 
                background: active ? "#eff6ff" : "#fff", 
                color: active ? "#1d4ed8" : "#374151", 
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={label}
                    width={18}
                    height={18}
                    style={{
                        borderRadius: "50%",
                        border: "1px solid #e5e7eb",
                        flexShrink: 0,
                    }}
                    loading="lazy"
                />
                ) : null}
                <span>{label}</span>
            </div>
        </button>
  ) ;
}

export const PrFilter = ({ orgs, authors, setOrgFilter, setAuthorFilter, orgFilter, authorFilter }): React.ReactElement => {
    return (
        <div style={prFilters}>

            {/* Org filters */}
            <div style={filterRow}>
                <strong style={filterLbl}>Org:</strong>

                <FilterPill
                    label="All"
                    active={orgFilter === null}
                    onClick={() => setOrgFilter(null)}
                />

                {orgs.map((org) => (
                    <FilterPill
                        key={org}
                        label={org}
                        active={orgFilter === org}
                        onClick={() => setOrgFilter(org)}
                    />
                ))}
            </div>

            {/* Author filters */}
            <div style={filterRow}>
                <strong style={filterLbl}>Author:</strong>

                <FilterPill
                    label="All"
                    active={authorFilter === null}
                    onClick={() => setAuthorFilter(null)}
                />

                {authors.map((author) => (
                    <FilterPill
                        key={author.author}
                        label={author.author}
                        avatarUrl={author.authorAvatarUrl}
                        active={authorFilter === author.author}
                        onClick={() => setAuthorFilter(author.author)}
                    />
                ))}
            </div>
        </div>
    );
};

// const filterPillBtn: React.CSSProperties = {padding: "6px 12px", borderRadius: 999, fontSize: 12, border: "1px solid", cursor: "pointer", whiteSpace: "nowrap" };
const filterLbl: React.CSSProperties = { fontSize: 12, color: "#6b7280", marginRight: 4 };
const filterRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" };
const prFilters: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 };

const filterPillBtn: React.CSSProperties = {
    cursor: "pointer",
    border: "1px solid",
    height: 32,
    minHeight: 32,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "0 12px",
    borderRadius: 999,
    fontSize: 13,
    lineHeight: "32px",
    whiteSpace: "nowrap",
};