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

setTimeout(() => {
  siteData["dt.in.th"] = {
    desktopImageUrl:
      "https://capture.the.spacet.me/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL2R0LmluLnRoIiwid2lkdGgiOjEyODAsImhlaWdodCI6OTYwLCJ3YWl0VW50aWwiOiJuZXR3b3JraWRsZTAiLCJpc3MiOiJhdXRvbWF0cm9uIn0.MIeunN8-0jNNQYYxDpA4Dw2Tv9Ml_li4_AqNk49JcX9AfleBDqGd5YNB0PB0nGfD6xsMmTytyVosrRzFcdTAM-aAtjMbS4wKFStk5tapbfYqoMHqTMjG-rm5yxbwox2BsOuadEdM1Xx4x8grM9VE0tfGzzRuw-F3bWZs4IWJ7K94-hWcMXFtWCg4an37nbV36ZenYfPFzvzcqEjLVUFbqX8pM6FM80mIXdQdRTH7nFIDb1WBWNENje7ire2Ughv0up4Vi3aWvaFHxy47hQ2zegI7NK0klTXbuRyYpWs0aXTj3K0cosJTd5SOv_fRLgAAh9WRQAiDZDYO5Ns_EZoItA.png",
    mobileImageUrl:
      "https://capture.the.spacet.me/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL2R0LmluLnRoIiwid2lkdGgiOjM2MCwiaGVpZ2h0Ijo2NDAsIndhaXRVbnRpbCI6Im5ldHdvcmtpZGxlMCIsImRldmljZVNjYWxlRmFjdG9yIjoyLCJpc3MiOiJhdXRvbWF0cm9uIn0.f9MhD14JOQWVQV_Q-vkhCeqnHZTxcMgejFYH7LmUtWeIifsLJI_fd_SVSh2jribO5XsrTNMw5U-u9fFHvjP4OjNnnxvwYTtsXrec0JUNSpiwMZsdq4RzLBHcV5JcfgYzGM4NHMUw4xTekZYUsWMMSbkNUfkY-gtNv4aH5WJ4bcvdwY1MzYbn3SmCRJUdo6dTv3-UhR-n2eFX54_-utOM64thZt2eMUkCXtqWTTJekMBMJrd48rkctk9pI0NX2GShDPdzSnlVbCfHQAHI6pGSf51dKrl21EOXuIHCXbm06EbOQdehm54gedvKWIoqAwehPBLSJicRZjob1L4j1qw1WQ.png",
  }
  siteData["wonderful.software"] = {
    desktopImageUrl:
      "https://capture.the.spacet.me/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3dvbmRlcmZ1bC5zb2Z0d2FyZSIsIndpZHRoIjoxMjgwLCJoZWlnaHQiOjk2MCwid2FpdFVudGlsIjoibmV0d29ya2lkbGUwIiwiaXNzIjoiYXV0b21hdHJvbiJ9.yTUMHNwSe63n-SsjvbOjtfuwsk3gxsocFB5JgzHFQAHyzzXTvvwHjhey0I-MeVijBCSxwO3jT6l4IuP1wpgGAM0mIoURAr7nGvnpy0p1sl7hqyqxmcwlyEfslVsGBoR_qgqPAh9E9nMZXYlzynXe509tJ5hMW7o_PkQKW0hLboa1y-2HOmPRUFNR2-DovXWCI6e8EEJmC37yoQfO-7DGI7PYNI1vN3eXlJVof-dO5c3kauR3-fy8aXX3wLYfYw7yQOFLK9eAUvAHCBKWyH_bLQ40oI2_yOHHqS5qOGX5OZIZemrCt6x3q3AgT5dbXOFjx2FWf6k6TfINgIKscsdlfQ.png",
    mobileImageUrl:
      "https://capture.the.spacet.me/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJodHRwczovL3dvbmRlcmZ1bC5zb2Z0d2FyZSIsIndpZHRoIjozNjAsImhlaWdodCI6NjQwLCJ3YWl0VW50aWwiOiJuZXR3b3JraWRsZTAiLCJkZXZpY2VTY2FsZUZhY3RvciI6MiwiaXNzIjoiYXV0b21hdHJvbiJ9.nUZkpae5XLfV4JiHHzW2s9zq9yX7lv4cRZ953oMx8euiw-1qMZjrxFBLJiZSHeKUNjO8SgRCUG7JFHLkyK-aboaUV6y-ceJhSqfC5yyu-tA7m79KMml51EoXkfc9_8FFwPXvyFhhaEtJbjcpSyYdWw7LBpR8TUBBu3PdKopWpYpcIibVRaHosJuVQPJ5nOxTcPWJgaXJK6k2j7YgFGAQIEi6pJ6Ay9MSHITI6lBJVf7oVcIhyy_t09NN57WXTMLzrTpUc6i8Iol3OUlO7dmr-JAsc-y6izCF5T9Z7TF4LRC5vvc0JU0B2eOTMOLr1JlOeYoxzthFaNmP7BYfk-Iujw.png",
  }
}, 1000)
