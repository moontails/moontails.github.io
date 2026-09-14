(function () {
  const summits = Array.isArray(window.SUMMITS) ? window.SUMMITS : [];

  const formatDate = (date) => {
    const [, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" })
      .format(new Date(2020, month - 1, day));
  };

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const renderSummits = () => {
    if (!summits.length) return;

    const years = new Map();
    summits.forEach((summit) => {
      const year = summit.date.slice(0, 4);
      years.set(year, [...(years.get(year) || []), summit]);
    });
    const yearEntries = [...years.entries()].sort((a, b) => b[0].localeCompare(a[0]));

    const highest = summits
      .map((summit) => ({ summit, value: Number(String(summit.elevation).replace(/[^\d]/g, "")) }))
      .sort((a, b) => b.value - a.value)[0];

    setText("summit-total", String(summits.length));
    setText("summit-highest", highest.summit.elevation);

    const container = document.getElementById("summit-years");
    if (!container) return;

    container.replaceChildren(...yearEntries.map(([year, yearSummits], index) => {
      const details = document.createElement("details");
      details.className = "summit-year";
      details.open = index === 0;

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
        meta.textContent = [summit.elevation, summit.location].filter(Boolean).join(" / ");
        item.append(date, name, meta);
        list.appendChild(item);
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
