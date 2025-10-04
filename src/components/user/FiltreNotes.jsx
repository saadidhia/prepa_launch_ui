import React from "react";
import Button from "@mui/material/Button";

export default function FiltreNotes({
  userSubjects,
  selectedSubjects,
  selectedContexts,
  toggleSubject,
  toggleContext,
  handleOpenCreate,
}) {
  return (
    <div style={{ margin: "20px" }}>
      <div
        style={{
          display: "flex",
          gap: "40px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Subject Filter Buttons */}
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          <Button
            style={{ margin: "10px", fontSize: "15px" }}
            variant="contained"
            color="primary"
            onClick={handleOpenCreate}
          >
            Créer une note
          </Button>

          {userSubjects.map((subject, index) => (
            <div
              key={index}
              onClick={() => toggleSubject(subject.name)}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: selectedSubjects.has(
                  subject.name.trim().toLowerCase()
                )
                  ? "#ff5722"
                  : "#0079bf",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                userSelect: "none",
                transition: "background-color 0.3s",
              }}
            >
              {subject.name.slice(0, 4).toUpperCase()}
            </div>
          ))}
        </div>

        {/* Context Filter Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          {["rules", "summary"].map((ctx) => (
            <Button
              key={ctx}
              variant="contained"
              onClick={() => toggleContext(ctx)}
              style={{
                backgroundColor: selectedContexts.has(ctx)
                  ? "#ff5722"
                  : "#0079bf",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "20px",
                paddingTop: "0px",
                paddingBottom: "0px",
              }}
            >
              {ctx}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
