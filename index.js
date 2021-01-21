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
    background: linear-gradient(to bottom, #fff0, #fffd, #fff);
  }
  @media (min-width: 960px) {
    #aux {
      top: 20px;
      width: 375px;
      left: auto;
      padding: 14px 20px 12px;
      border-left: 1px solid #f5f4f3;
    }
    #aux::after {
      height: 128px;
      background: linear-gradient(to bottom, #fff0, #fff);
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

  .site-info__toolbar {
    position: fixed;
    bottom: 24px;
    left: 24px;
    right: 24px;
    z-index: 95;
  }
  @media (min-width: 960px) {
    .site-info__toolbar {
      position: relative;
      bottom: unset;
      left: unset;
      right: unset;
    }
  }

  .site-info-item {
    position: absolute;
    top: 0px;
    right: 20px;
    left: 20px;
    text-align: center;
    transition: 0.3s transform, 0.3s opacity;
  }
  .site-info-item__body {
    max-width: 360px;
    margin: 0 auto;
  }
  @media (min-width: 960px) {
    .site-info-item {
      top: 80px;
      text-align: left;
    }
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
        <div class="site-info__toolbar">
          <webring-toolbar
            @previous="previous"
            @random="random"
            @next="next"
            @list="showList"
            :autoNext="autoNext"
            :autoRandom="autoRandom"
          />
        </div>
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
                <image-that-doesnt-display-at-first-but-fades-in-once-loaded
                  v-if="link.siteData"
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
    const autoNext = Vue.ref(false)
    const autoRandom = Vue.ref(false)

    let needsInboundTransition = false
    let inboundReferrer = ""

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

    /**
     * Sends non-essential tracking event, e.g. button clicks, to Google Analytics,
     * for collecting usage statistics with no personalization.
     */
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

    /**
     * Sends important beacons about how the webring is functioning.
     * Data is completely anonymous.
     */
    const sendBeacon = (action, site, referrer = "") => {
      try {
        if (navigator.sendBeacon) {
          const query = new URLSearchParams()
          query.set("hostname", location.hostname)
          query.set("action", action)
          query.set("site", site)
          // In HTTP, "Referer" is a standardized misspelling of the English word "referrer".
          // See: https://en.wikipedia.org/wiki/HTTP_referer
          query.set("referer", referrer)
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
        const id = ((hash.match(/[a-z0-9\.-]+/i) || [])[0] || "").toLowerCase()
        location.replace("#/" + id)
        const matchedLink = links.find((l) => l.id === id)
        if (matchedLink) {
          sendBeacon("inbound", matchedLink.id)
          needsInboundTransition = true
          inboundReferrer = matchedLink.id
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
      sendBeacon("outbound", link.id, inboundReferrer)
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
        autoRandom.value = true
        random()
      }
      if (inbound) {
        setTimeout(() => {
          next()
          autoNext.value = true
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
      autoNext,
      autoRandom,
    }
  },
})

injectStyle(css`
  .image-that-doesnt-display-at-first-but-fades-in-once-loaded {
    opacity: 0;
    transition: 0.2s opacity;
  }
  .image-that-doesnt-display-at-first-but-fades-in-once-loaded[data-loaded="1"] {
    opacity: 1;
  }
`)
app.component("image-that-doesnt-display-at-first-but-fades-in-once-loaded", {
  props: {
    src: {},
  },
  template: html`<img
    class="image-that-doesnt-display-at-first-but-fades-in-once-loaded"
    loading="lazy"
    :src="src"
    @load="$refs.image && $refs.image.setAttribute('data-loaded', '1')"
    ref="image"
  />`,
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
        setTimeout(() => {
          hide.value = false
        }, 1000)
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

injectStyle(css`
  .webring-toolbar {
    border: 1px solid #d9d8d7;
    border-radius: 3px;
    box-shadow: 0 1px 7px #0002;
    overflow: hidden;
  }
  .webring-toolbar__actions {
    display: flex;
    background: #e9e8e7;
    gap: 1px;
  }
  .webring-toolbar__info {
    background: #e9e8e7;
    border-bottom: 1px solid #d9d8d7;
    padding: 4px;
    font-size: 0.9em;
  }
  @media (min-width: 960px) {
    .webring-toolbar__mobile-only-action {
      display: none;
    }
  }
`)

app.component("webring-toolbar", {
  props: {
    autoNext: Boolean,
    autoRandom: Boolean,
  },
  template: html`<div class="webring-toolbar">
    <div class="webring-toolbar__actions">
      <!-- Icons from the IcoMoon Free pack, CC BY 4.0 - https://github.com/Keyamoon/IcoMoon-Free -->
      <webring-toolbar-button
        @click="$emit('previous')"
        icon="M12.586 27.414l-10-10c-0.781-0.781-0.781-2.047 0-2.828l10-10c0.781-0.781 2.047-0.781 2.828 0s0.781 2.047 0 2.828l-6.586 6.586h19.172c1.105 0 2 0.895 2 2s-0.895 2-2 2h-19.172l6.586 6.586c0.39 0.39 0.586 0.902 0.586 1.414s-0.195 1.024-0.586 1.414c-0.781 0.781-2.047 0.781-2.828 0z"
      >
        Previous
      </webring-toolbar-button>

      <webring-toolbar-button
        @click="$emit('list')"
        class="webring-toolbar__mobile-only-action"
        icon="M12 2h20v4h-20v-4zM12 14h20v4h-20v-4zM12 26h20v4h-20v-4zM0 4c0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4s-4-1.791-4-4zM0 16c0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4s-4-1.791-4-4zM0 28c0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4s-4-1.791-4-4z"
      >
        List
      </webring-toolbar-button>

      <webring-toolbar-button
        @click="$emit('random')"
        icon="M24 22h-3.172l-5-5 5-5h3.172v5l7-7-7-7v5h-4c-0.53 0-1.039 0.211-1.414 0.586l-5.586 5.586-5.586-5.586c-0.375-0.375-0.884-0.586-1.414-0.586h-6v4h5.172l5 5-5 5h-5.172v4h6c0.53 0 1.039-0.211 1.414-0.586l5.586-5.586 5.586 5.586c0.375 0.375 0.884 0.586 1.414 0.586h4v5l7-7-7-7v5z"
        :flash="autoRandom"
      >
        Random
      </webring-toolbar-button>

      <webring-toolbar-button
        @click="$emit('next')"
        icon="M19.414 27.414l10-10c0.781-0.781 0.781-2.047 0-2.828l-10-10c-0.781-0.781-2.047-0.781-2.828 0s-0.781 2.047 0 2.828l6.586 6.586h-19.172c-1.105 0-2 0.895-2 2s0.895 2 2 2h19.172l-6.586 6.586c-0.39 0.39-0.586 0.902-0.586 1.414s0.195 1.024 0.586 1.414c0.781 0.781 2.047 0.781 2.828 0z"
        :flash="autoNext"
      >
        Next
      </webring-toolbar-button>
    </div>
  </div>`,
})

injectStyle(css`
  .webring-toolbar-button {
    border: 0;
    width: 33%;
    flex: 1;
    font: inherit;
    background: linear-gradient(to bottom, white, #f5f4f3);
    cursor: pointer;
    padding: 8px 0;
    text-align: center;
    color: #353435;
    --flash-opacity: 0;
    position: relative;
  }
  .webring-toolbar-button::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    content: "";
    display: block;
    background: #da3567;
    opacity: var(--flash-opacity);
  }
  .webring-toolbar-button[data-flash="1"] {
    animation: 0.5s webring-toolbar-button__flash;
  }
  .webring-toolbar-button[data-flash="1"]::before {
    animation: 0.5s webring-toolbar-button__flash-bg;
  }
  .webring-toolbar-button svg {
    width: 18px;
    height: 18px;
    position: relative;
  }
  .webring-toolbar-button__text {
    display: block;
    font-size: 0.85em;
    line-height: 1em;
    position: relative;
  }
  @keyframes webring-toolbar-button__flash {
    from {
      color: #fff;
    }
    to {
      color: #353435;
    }
  }
  @keyframes webring-toolbar-button__flash-bg {
    from {
      opacity: 1;
    }
    to {
      color: #353435;
    }
  }
`)
app.component("webring-toolbar-button", {
  props: {
    icon: {
      type: String,
    },
    flash: {
      type: Boolean,
    },
  },
  template: html`<button
    class="webring-toolbar-button"
    :data-flash="flash ? 1 : 0"
  >
    <svg viewBox="0 0 32 32">
      <path :d="icon" fill="currentColor" />
    </svg>
    <span class="webring-toolbar-button__text">
      <slot></slot>
    </span>
  </button>`,
})

const instance = app.mount("#app")
