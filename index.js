/// <reference path="typedefs.d.ts" />
const siteData = Vue.reactive({})

const app = Vue.createApp({
  setup() {
    const currentLink = Vue.ref()
    const showingListOnMobile = Vue.ref(false)
    const links = Array.from(document.querySelectorAll("#ring > li")).map(
      (li) => {
        const id = li.id
        const a = li.querySelector("a")
        const url = a.href
        const text = a.innerText
        const select = () => {
          currentLink.value = link
          showingListOnMobile.value = false
          location.hash = "#" + id
        }
        const link = Vue.reactive({ id, text, url, a, li, select })
        a.addEventListener("click", (e) => {
          e.preventDefault()
          select()
        })
        return link
      }
    )

    const updateCurrentLink = () => {
      const hash = location.hash
      const found = links.find((l) => "#" + l.id === hash)
      if (found) {
        currentLink.value = found
      }
    }
    updateCurrentLink()

    const previous = () => {
      let index = links.indexOf(currentLink.value)
      if (index === -1) index = 0
      index = (index + links.length - 1) % links.length
      links[index].select()
    }
    const random = () => {
      links[~~(Math.random() * links.length)].select()
    }
    const next = () => {
      let index = (links.indexOf(currentLink.value) + 1) % links.length
      links[index].select()
    }

    const currentSiteData = Vue.computed(() => {
      return currentLink.value && siteData[currentLink.value.id]
    })
    const showList = () => {
      showingListOnMobile.value = true
    }

    Vue.onMounted(async () => {
      const response = await fetch(
        "https://wonderfulsoftware.github.io/webring-site-data/data.json"
      )
      if (!response.ok) {
        throw new Error("Unable to fetch site data")
      }
      const data = await response.json()
      Object.assign(siteData, data)
    })

    return {
      previous,
      random,
      next,
      currentLink,
      currentSiteData,
      showList,
      showingListOnMobile,
    }
  },
})

const instance = app.mount("#app")
