/// <reference path="typedefs.d.ts" />
const siteData = Vue.reactive({})
const html = String.raw
const css = String.raw
const injectStyle = (source) => {
  const style = document.createElement("style")
  style.textContent = source
  document.head.appendChild(style)
}

injectStyle(css`
  #aux {
    position: fixed;
    top: 64px;
    right: 0;
    bottom: 0;
    left: 0;
    background: white;
    padding: 0 20px 20px;
    opacity: 1;
    transition: 0.5s opacity, 0.5s transform;
  }
  .--hide-on-mobile#aux {
    opacity: 0;
    pointer-events: none;
  }
  @media (min-width: 960px) {
    #aux {
      top: 20px;
      width: 360px;
      left: auto;
      bottom: auto;
      padding: 14px 20px 12px;
      border-left: 1px solid #f5f4f3;
    }
    .--hide-on-mobile#aux {
      opacity: 1;
      pointer-events: unset;
    }
  }
  #site-info {
    max-width: 360px;
    margin: 0 auto;
  }

  .info-link {
    display: block;
    overflow: hidden;
    padding-top: 177%;
    position: relative;
    border-radius: 3px;
    background: #e9e8e7;
  }
  .info-link::after {
    display: block;
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    box-shadow: inset 0 1px 8px #0002;
  }
  .info-link img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .info-link__visit {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #88858355;
    opacity: 0;
    transition: 0.1s opacity;
  }
  .info-link:hover .info-link__visit {
    opacity: 1;
  }
  .info-link__text {
    background: #605850cc;
    color: #fff;
    padding: 8px 16px;
    border-radius: 100px;
  }
  #site-nav {
    display: flex;
    margin-left: -0.3rem;
  }
  #site-nav button {
    margin-left: 0.3rem;
    padding: 5px 7px;
    background: transparent;
    border: 1px solid #e9e8e7;
    border-radius: 3px;
    cursor: pointer;
  }
  #site-nav #show-list-button {
    margin-left: auto;
  }
  @media (min-width: 960px) {
    #site-nav #show-list-button {
      display: none;
    }
  }
  h2 {
    margin: 0.8rem 0;
  }
`)

const app = Vue.createApp({
  template: html` <div
    id="aux"
    v-if="currentLink"
    :class="{'--hide-on-mobile': hidingListOnMobile}"
  >
    <div id="site-info">
      <nav id="site-nav">
        <button @click="previous">&laquo; previous</button>
        <button @click="random">random</button>
        <button @click="next">next &raquo;</button>
        <button @click="showList" id="show-list-button">list</button>
      </nav>
      <h2>{{ currentLink.text }}</h2>
      <p>
        <a :href="currentLink.url" class="info-link">
          <img
            v-if="currentSiteData"
            style="max-width: 100%"
            :src="currentSiteData.mobileImageUrl"
          />
          <span class="info-link__visit">
            <span class="info-link__text">เข้าชมเว็บไซต์</span>
          </span>
        </a>
      </p>
    </div>
  </div>`,
  setup() {
    const currentLink = Vue.ref()
    const hidingListOnMobile = Vue.ref(true)
    const links = Array.from(document.querySelectorAll("#ring > li")).map(
      (li) => {
        const id = li.id
        const a = li.querySelector("a")
        const url = a.href
        const text = a.innerText
        const select = () => {
          currentLink.value = link
          hidingListOnMobile.value = false
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
        hidingListOnMobile.value = false
      } else if (hash === "#list") {
        hidingListOnMobile.value = true
      }
    }

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
      hidingListOnMobile.value = true
      location.hash = "#list"
    }

    Vue.onMounted(() => {
      updateCurrentLink()
      if (!currentLink.value && location.hash !== "#list") {
        random()
      }
      window.addEventListener("hashchange", () => {
        updateCurrentLink()
      })
      requestAnimationFrame(() => {
        hidingListOnMobile.value = false
      })
    })

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

    Vue.watch(
      () => currentLink.value,
      (currentLink, previousLink) => {
        if (previousLink) {
          previousLink.li.removeAttribute("data-was-selected")
        }
        if (currentLink) {
          currentLink.li.setAttribute("data-was-selected", "1")
        }
      }
    )

    return {
      previous,
      random,
      next,
      currentLink,
      currentSiteData,
      showList,
      hidingListOnMobile,
    }
  },
})

const instance = app.mount("#app")
