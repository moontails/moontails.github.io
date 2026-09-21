(function () {
  const CSV_PATH = "data/summits.csv";

  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n/).filter((line) => line.length);
    if (!lines.length) return [];

    const parseLine = (line) => {
      const fields = [];
      let field = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (inQuotes) {
          if (char === '"' && line[i + 1] === '"') { field += '"'; i++; }
          else if (char === '"') inQuotes = false;
          else field += char;
        } else if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          fields.push(field);
          field = "";
        } else {
          field += char;
        }
      }
      fields.push(field);
      return fields;
    };

    const header = parseLine(lines[0]);
    return lines.slice(1).map((line) => {
      const fields = parseLine(line);
      const row = {};
      header.forEach((key, index) => { row[key] = fields[index]; });
      return row;
    });
  };

  const formatDate = (date) => {
    const [, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })
      .format(new Date(2020, month - 1, day));
  };

  const formatElevation = (feet) => `${Number(feet).toLocaleString("en-US")} ft`;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const renderSummits = (summits) => {
    if (!summits.length) return;

    const years = new Map();
    summits.forEach((summit) => {
      const year = summit.date.slice(0, 4);
      years.set(year, [...(years.get(year) || []), summit]);
    });
    const yearEntries = [...years.entries()].sort((a, b) => b[0].localeCompare(a[0]));

    const highest = summits.reduce((max, summit) =>
      Number(summit.elevation_ft) > Number(max.elevation_ft) ? summit : max);

    setText("summit-total", String(summits.length));
    setText("summit-highest", formatElevation(highest.elevation_ft));

    const container = document.getElementById("summit-years");
    if (!container) return;

    container.replaceChildren(...yearEntries.map(([year, yearSummits], index) => {
      const details = document.createElement("details");
      details.className = "summit-year";
      details.open = index === 0;
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        container.querySelectorAll(".summit-year").forEach((other) => {
          if (other !== details) other.open = false;
        });
      });

      const summary = document.createElement("summary");
      const yearLabel = document.createElement("strong");
      const count = document.createElement("span");
      yearLabel.textContent = year;
      count.textContent = `${yearSummits.length} ${yearSummits.length === 1 ? "summit" : "summits"}`;
      summary.append(yearLabel, count);

      const list = document.createElement("ol");
      list.className = "summit-list";
      yearSummits.forEach((summit) => {
        const item = document.createElement("li");
        const date = document.createElement("span");
        const name = document.createElement("span");
        const meta = document.createElement("span");
        date.className = "summit-date";
        name.className = "summit-name";
        meta.className = "summit-meta";
        date.textContent = formatDate(summit.date);
        name.textContent = summit.peak;
        meta.textContent = [formatElevation(summit.elevation_ft), summit.location].filter(Boolean).join(" / ");
        item.append(date, name, meta);
        list.appendChild(item);
      });

      details.append(summary, list);
      return details;
    }));
  };

  const init = () => {
    fetch(CSV_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`${CSV_PATH}: ${response.status}`);
        return response.text();
      })
      .then((text) => renderSummits(parseCSV(text)))
      .catch((error) => console.error("Could not load summit log:", error));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
