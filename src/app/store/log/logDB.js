export const DB_VERSION = 1
export const DB_NAME = "logdb"

export function logDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onsuccess = () => {
      let db = request.result

      db.onversionchanged = (event) => {
        // Another tab upgraded the database
        console.error("IndexedDB Version Changed, reloading page")
        db.close()
        window.location.reload()
      }

      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      // Database needs to be created or upgraded
      const db = request.result
      if (!db.objectStoreNames.contains("logs")) {
        const logsStore = db.createObjectStore("logs", {
          keyPath: "key",
        })
        logsStore.createIndex("key", "key", { unique: false })
      }
    }

    request.onerror = () => {
      console.error("IndexedDB Error", request)
      reject("Error occured")
    }
    request.onblocked = () => {
      // This should only happen if we upgrade the database while another tab has an older version open
      // AND the other tab fails to close it when notified via `onversionchanged`
      console.error("IndexedDB Blocked", request)
      alert("There seem to be other tabs open with an older version of this app. Please close them first")
      reject("Blocked!")
    }
  })
}
