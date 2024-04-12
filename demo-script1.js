var axiosScript = document.createElement("script");
axiosScript.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
document.head.appendChild(axiosScript);

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function setCookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue + ";";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function generateAnonymousId() {
  anonymousId = getCookie("anonymousId");
  if (anonymousId == "") {
    const timestamp = Date.now().toString(36);
    const randomString = generateRandomString(16);
    anonymousId = timestamp + "-" + randomString;
    setCookie("anonymousId", anonymousId);
  }
  return anonymousId;
}

const insights = {
  anonymousId: generateAnonymousId(),
  userId: null,
  tenantId: null,
  authToken: null,
  init: function (userId, tenantId, authToken) {
    this.userId = userId;
    this.tenantId = tenantId;
    this.authToken = authToken;

    const elements = ["button", "a"];

    elements.forEach((element) => {
      document.querySelectorAll(element).forEach((element) => {
        element.addEventListener("click", (event) => {
          this.sendEventData(element);
        });
      });
    });

    setTimeout(() => {
      this.sendLoadData();
    }, 1000);

    setInterval(() => {
      this.sendOnline();
    }, 30000);
  },
  checkStatus: function (userId, tenantId, authToken) {
    axios
      .post("http://localhost/userEvents", {
        userId: userId,
        tenantId: tenantId,
        authToken: authToken,
      })
      .then((response) => {        
        if (response.status === 200) {
          console.log("Insights tracking Successfully Initialized!!");
          return true;
        } else if (response.status === 403) {
          console.log("User verification failed!");
          return false;
        } else {
          console.log("Unexpected response status:", response.status);
          return false;
        }
      })
      .catch((error) => {
        console.error("Error verifying user:", error);
        return false;
      });
  },

  sendLoadData: function () {
    const timing = window.performance.timing;
    axios.post("http://localhost/userEvents/default/trackEvents", {
      tenantId: this.tenantId,
      userId: this.userId,
      type: "PAGECLICK",
      platform: navigator.platform,
      loadTime: timing.loadEventEnd
        ? timing.loadEventEnd - timing.requestStart
        : 0,
      url: window.location.href,
      authToken: this.authToken,
    });
  },

  sendOnline: function () {
    console.log(this.anonymousId);
    axios.post("http://localhost/userEvents/default/trackEvents", {
      tenantId: this.tenantId,
      userId: this.userId,
      type: "ONLINE",
      url: window.location.href,
      anonymousId: this.anonymousId,
      authToken: this.authToken,
    });
  },

  sendEventData: function (element) {
    const featureId =
      element.dataset.insightid || element.id || element.classList[0];
    axios.post("http://localhost/userEvents/default/trackEvents", {
      tenantId: this.tenantId,
      userId: this.userId,
      type: "FEATURECLICK",
      featureId: featureId,
      authToken: this.authToken,
      url: window.location.href,
    });
  },
};

window.addEventListener("contextmenu", (e) => {
  var userId = "pranav";
  // insights.init("pranav", "ZOMATO", "654321");
  insights.checkStatus("pranav", "ZOMATO", "654321");
});
