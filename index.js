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
  #aux::after {
    position: absolute;
    display: block;
    content: "";
    z-index: 90;
    height: 128px;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    background: linear-gradient(to bottom, #fff0, #fff);
  }
  @media (min-width: 960px) {
    #aux {
      top: 20px;
      width: 360px;
      left: auto;
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

  .site-info-item {
    position: absolute;
    top: 42px;
    right: 20px;
    left: 20px;
    transition: 0.3s transform, 0.3s opacity;
  }
  .site-info-item__body {
    max-width: 360px;
    margin: 0 auto;
  }

  h2 {
    margin: 0.8rem 0 0;
  }
  .site-description {
    margin-top: 0;
    color: #605850;
    line-height: 1.5em;
    height: 3em;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .info-link {
    display: block;
    overflow: hidden;
    padding-top: 170.67%;
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
    z-index: 90;
  }
  .info-link img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 50;
  }
  .info-link__visit {
    position: absolute;
    top: 0;
    right: 0;
    height: 256px;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 70;
  }
  .info-link:hover .info-link__visit {
    opacity: 1;
  }
  .info-link::before {
    display: block;
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #888583;
    z-index: 60;
    opacity: 0.1;
    transition: 0.1s opacity;
  }
  .info-link:hover::before {
    opacity: 0.2;
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

  /* https://github.com/dtinth/blurhash-image */
  blurhash-image {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #888 no-repeat center;
    background-size: 100% 100%;
  }
`)

const app = Vue.createApp({
  template: html`
    <div
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
        <div
          class="site-info-item"
          v-for="({link, style}, id) of viewingLinks"
          :key="id"
          :style="style"
        >
          <div class="site-info-item__body">
            <h2>{{ link.text }}</h2>
            <p class="site-description">
              {{ link.siteData && link.siteData.description }}
            </p>
            <p>
              <a :href="link.url" class="info-link" @click="go(link)">
                <blurhash-image
                  v-if="link.siteData && link.siteData.blurhash"
                  :blurhash="link.siteData.blurhash"
                ></blurhash-image>
                <img
                  v-if="link.siteData"
                  style="max-width: 100%"
                  :src="link.siteData.mobileImageUrlV2"
                />
                <span class="info-link__visit">
                  <span class="info-link__text">เข้าชมเว็บไซต์</span>
                </span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
    <for-first-timer />
  `,
  setup() {
    const currentLink = Vue.ref()

    let needsInboundTransition = false
    const viewingLinks = Vue.reactive({})
    Vue.watch(
      () => currentLink.value,
      (link, previous) => {
        let exitTransform = "scale(0.5)"
        if (link) {
          let enterTransform = "scale(0.5)"
          if (needsInboundTransition) {
            enterTransform = "scale(1.5)"
            needsInboundTransition = false
          }
          if (previous) {
            enterTransform = `translateX(${
              link.index > previous.index ? 100 : -100
            }%)`
            exitTransform = `translateX(${
              link.index > previous.index ? -100 : 100
            }%)`
          }
          const view = Vue.reactive({
            link,
            style: {
              opacity: 0,
              transform: enterTransform,
            },
          })
          viewingLinks[link.id] = view
          Vue.nextTick(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                view.style.opacity = 1
                view.style.transform = ""
              })
            })
          })
        }
        for (const key of Object.keys(viewingLinks)) {
          if (key !== link.id) {
            const view = viewingLinks[key]
            if (view && !view.transitioningOut) {
              view.transitioningOut = true
              view.style.opacity = 0
              view.style.transform = exitTransform
              view.style.pointerEvents = "none"
              setTimeout(() => {
                if (viewingLinks[key] === view) {
                  delete viewingLinks[key]
                }
              }, 1000)
            }
          }
        }
      },
      { immediate: true }
    )

    const hidingListOnMobile = Vue.ref(true)
    const links = Array.from(document.querySelectorAll("#ring > li")).map(
      (li, index) => {
        const id = li.id
        const a = li.querySelector("a")
        const url = a.href
        const text = a.innerText
        const select = () => {
          currentLink.value = link
          hidingListOnMobile.value = false
          location.hash = "#/" + id
          sendGtagEvent("view", "link", id)
        }
        const data = Vue.computed(() => siteData[id])
        const link = Vue.reactive({
          id,
          text,
          url,
          a,
          li,
          select,
          siteData: data,
          index,
        })
        a.addEventListener("click", (e) => {
          e.preventDefault()
          select()
        })
        return link
      }
    )
    const sendGtagEvent = (action, category, label, value) => {
      try {
        if (!window.gtag) return
        gtag("event", action, {
          event_category: category,
          event_label: label,
          value: value,
        })
      } catch (e) {
        console.error("Unable to send gtag", e)
      }
    }
    const sendEvent = (action, site) => {
      try {
        if (navigator.sendBeacon) {
          const query = new URLSearchParams()
          query.set("hostname", location.hostname)
          query.set("action", action)
          query.set("site", site)
          const body = new URLSearchParams()
          body.set("t", new Date().toJSON())
          navigator.sendBeacon(
            `https://us-central1-wonderful-software.cloudfunctions.net/webring-notify?${query}`,
            body
          )
        }
      } catch (e) {
        console.error("Unable to send beacon", e)
      }
    }
    const processInboundLink = () => {
      const hash = location.hash
      if (hash.startsWith("#") && !hash.startsWith("#/")) {
        const id = (hash.match(/[a-z0-9\.-]+/) || [])[0] || ""
        location.replace("#/" + id)
        const matchedLink = links.find((l) => l.id === id)
        if (matchedLink) {
          sendEvent("inbound", matchedLink.id)
          needsInboundTransition = true
          return true
        }
      }
    }
    const updateCurrentLink = () => {
      const hash = location.hash
      const found = links.find((l) => "#/" + l.id === hash)
      if (found) {
        currentLink.value = found
        hidingListOnMobile.value = false
      } else if (hash === "#/list") {
        hidingListOnMobile.value = true
      }
    }
    const go = (link) => {
      sendEvent("outbound", link.id)
    }

    const previous = () => {
      let index = currentLink.value ? currentLink.value.index : 0
      index = (index + links.length - 1) % links.length
      links[index].select()
      sendGtagEvent("previous", "button")
    }
    const random = () => {
      links[~~(Math.random() * links.length)].select()
      sendGtagEvent("random", "button")
    }
    const next = () => {
      let index =
        ((currentLink.value ? currentLink.value.index : -1) + 1) % links.length
      links[index].select()
      sendGtagEvent("next", "button")
    }

    const showList = () => {
      hidingListOnMobile.value = true
      location.hash = "#list"
    }

    Vue.onMounted(() => {
      const inbound = processInboundLink()
      updateCurrentLink()
      if (!currentLink.value && location.hash !== "#/list") {
        random()
      }
      if (inbound) {
        setTimeout(() => {
          next()
        }, 500)
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
          previousLink.li.removeAttribute("data-current")
        }
        if (currentLink) {
          currentLink.li.setAttribute("data-current", "1")
        }
      }
    )

    return {
      previous,
      random,
      next,
      currentLink,
      showList,
      hidingListOnMobile,
      viewingLinks,
      go,
    }
  },
})

injectStyle(css`
  #for-first-timer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 12px;
    z-index: 200;
    background: #f5f4f3;
    color: #353435;
    line-height: 1.5em;
    border: 0;
    text-align: left;
    border-top: 1px solid #d9d8d7;
    font-size: 0.9rem;
    transition: 1s transform;
    cursor: pointer;
  }
  #for-first-timer[data-hide="1"] {
    transform: translateY(140%);
  }
  .webring-symbol {
    display: inline-block;
    position: relative;
    width: 1.5em;
    height: 1em;
  }
  .webring-symbol > img {
    width: 1.4em;
    height: 1.4em;
    position: absolute;
    top: calc(50% - 0.7em);
    left: calc(50% - 0.7em);
  }
`)
app.component("for-first-timer", {
  template: html`<button
    id="for-first-timer"
    :data-hide="hide ? 1 : 0"
    @click="acknowledge"
    ref="button"
  >
    <strong>ยินดีต้อนรับสู่ “วงแหวนเว็บ”</strong>
    เว็บนี้สร้างขึ้นเพื่อส่งเสริมให้ศิลปิน นักออกแบบ และนักพัฒนา
    สร้างเว็บไซต์ของตัวเองและแบ่งปันการเข้าชมซึ่งกันและกัน
    เว็บที่เข้าร่วมวงจะใช้สัญลักษณ์
    <span class="webring-symbol">
      <img src="webring.svg" />
    </span>
    เพื่อเชื่อมเว็บเข้าด้วยกันเป็นวงกลม
    <span style="color: #888583">(กดเพื่อปิดข้อความนี้)</span>
  </button>`,
  setup() {
    const hide = Vue.ref(true)
    const button = Vue.ref()
    Vue.onMounted(() => {
      console.log(localStorage.WEBRING_ACKNOWLEDGED)
      if (!localStorage.WEBRING_ACKNOWLEDGED) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            hide.value = false
          })
        })
      }
    })
    const acknowledge = () => {
      localStorage.WEBRING_ACKNOWLEDGED = "1"
      hide.value = true
      if (button.value) {
        button.value.blur()
      }
    }
    return { hide, acknowledge, button }
  },
})

const instance = app.mount("#app")
