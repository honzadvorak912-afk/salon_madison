// =============================================================
//  SPOLEČNÝ SKRIPT - navigace / burger menu
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  const overlay = document.querySelector(".nav-overlay");

  if (burger && links) {
    const toggle = () => {
      const open = links.classList.toggle("open");
      burger.classList.toggle("open", open);
      if (overlay) overlay.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", toggle);
    if (overlay) overlay.addEventListener("click", toggle);
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        if (links.classList.contains("open")) toggle();
      })
    );
  }

  // zvýraznění aktivní stránky
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });
});
