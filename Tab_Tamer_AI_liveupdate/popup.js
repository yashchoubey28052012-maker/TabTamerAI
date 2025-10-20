document.addEventListener("DOMContentLoaded", async () => {
  const groupsDiv = document.getElementById("groups")
  const captureBtn = document.getElementById("captureBtn")
  const searchBox = document.getElementById("searchBox")
  const darkToggle = document.getElementById("darkToggle")

  captureBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "captureNow" }, () => loadGroups())
  })

  darkToggle.addEventListener("change", () => {
    document.body.style.background = darkToggle.checked ? "#111" : "#f7f9fc"
    document.body.style.color = darkToggle.checked ? "#fff" : "#111"
    document.main.style.background = darkToggle.checked ? "#fff" : "#111"
  })

  searchBox.addEventListener("input", () => loadGroups(searchBox.value))

  async function loadGroups(filter = "") {
    const data = await chrome.storage.local.get({
      lastGroups: [],
      lastTabInfos: [],
    })
    const groups = data.lastGroups || []
    const tabs = data.lastTabInfos || []

    groupsDiv.innerHTML = ""

    groups.forEach((g) => {
      const groupEl = document.createElement("div")
      groupEl.className = "group"
      const title = document.createElement("h3")
      title.textContent = g.name
      title.className = "title"
      groupEl.appendChild(title)
      ;(g.tabIndices || []).forEach((i) => {
        const t = tabs[i]
        if (!t) return
        if (filter && !t.title.toLowerCase().includes(filter.toLowerCase()))
          return
        const tabEl = document.createElement("div")
        tabEl.className = "tab"
        tabEl.textContent = t.title || t.url
        tabEl.onclick = () => chrome.tabs.create({ url: t.url })
        groupEl.appendChild(tabEl)
      })
      groupsDiv.appendChild(groupEl)
    })
  }

  loadGroups()
})
