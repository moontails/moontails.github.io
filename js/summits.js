(function () {
  const summits = Array.isArray(window.SUMMITS) ? window.SUMMITS : [];

  const formatDate = (date) => {
    const [, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })
      .format(new Date(2020, month - 1, day));
  };

  const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  };

  const renderSummits = () => {
    const years = new Map();
    summits.forEach((summit) => {
      const year = summit.date.slice(0, 4);
      years.set(year, [...(years.get(year) || []), summit]);
    });

    const yearEntries = [...years.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    const latest = summits[0];
    const highest = summits
      .map((summit) => ({
        ...summit,
        elevationNumber: Number(String(summit.elevation || "").replace(/[^\d]/g, ""))
      }))
      .filter((summit) => summit.elevationNumber)
      .sort((a, b) => b.elevationNumber - a.elevationNumber)[0];

    setText("summit-latest", latest ? latest.peak : "-");
    setText("summit-current-year", yearEntries[0] ? String(yearEntries[0][1].length) : "-");
    setText("summit-total", String(summits.length));
    setText("summit-highest", highest ? highest.peak : "-");

    const container = document.getElementById("summit-years");
    if (!container) {
      return;
    }

    if (!summits.length) {
      container.innerHTML = "<p>No successful summits found yet.</p>";
      return;
    }

    container.replaceChildren(...yearEntries.map(([year, yearSummits], index) => {
      const details = document.createElement("details");
      details.className = "summit-year";
      details.open = index === 0;

      const summary = document.createElement("summary");
      const label = document.createElement("span");
      const count = document.createElement("span");
      label.textContent = year;
      count.className = "summit-year-count";
      count.textContent = `${yearSummits.length} ${yearSummits.length === 1 ? "summit" : "summits"}`;
      summary.append(label, count);

      const list = document.createElement("ol");
      list.className = "summit-list";
      yearSummits.forEach((summit) => {
        const item = document.createElement("li");
        item.className = "summit-entry";

        const date = document.createElement("time");
        date.className = "summit-date";
        date.dateTime = summit.date;
        date.textContent = formatDate(summit.date);

        const detailsBlock = document.createElement("span");
        const name = document.createElement("span");
        const meta = document.createElement("span");
        name.className = "summit-name";
        meta.className = "summit-meta";
        name.textContent = summit.peak;
        meta.textContent = [summit.elevation, summit.location].filter(Boolean).join(" / ");
        detailsBlock.append(name, meta);

        item.append(date, detailsBlock);
        list.append(item);
      });

      details.append(summary, list);
      return details;
    }));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSummits);
  } else {
    renderSummits();
  }
}());
