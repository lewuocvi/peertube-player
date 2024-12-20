let lastCheckedIframes = new Set();
let canPlay = false;

async function peerTubePlayerHandler(iframeItem) {
  const PeerTubePlayer = window.PeerTubePlayer;

  let player = new PeerTubePlayer(iframeItem);

  async function playbackStatusUpdate({ position, volume, duration, playbackState }) {
    if (position > 60 && canPlay === false) {
      await player.pause();
    }
  }

  await player.ready; // wait for the player to be ready

  console.log("player is ready: ", { player });

  player.addEventListener("playbackStatusChange", (event) => {
    // 		playbackStatusUpdate(event); // either "playing" or "paused" or "ended"

    if (event === "playing") {
      player.addEventListener("playbackStatusUpdate", playbackStatusUpdate);
    } else {
      player.removeEventListener("playbackStatusUpdate", playbackStatusUpdate);
    }
  });
}

async function findAndLogIframes() {
  try {
    const currentIframes = new Set(document.querySelectorAll("iframe"));

    for (const iframe of currentIframes) {
      if (!lastCheckedIframes.has(iframe)) {
        const originalSrc = iframe.src || "";

        if (!originalSrc.includes("peertubeLink=0")) {
          // Bảo toàn các tham số URL hiện tại và thêm tham số cần thiết
          const url = new URL(originalSrc);
          url.searchParams.set("api", "1");
          url.searchParams.set("title", "0");
          url.searchParams.set("warningTitle", "0");
          url.searchParams.set("peertubeLink", "0");
          iframe.src = url.toString();

          // Cập nhật thuộc tính iframe
          iframe.width = "100%";
          iframe.height = "450";

          await peerTubePlayerHandler(iframe);
        }
      }
    }

    // Lưu trạng thái đã kiểm tra
    lastCheckedIframes = currentIframes;
  } catch (error) {
    console.error("Lỗi khi tìm và xử lý iframe:", error);
  }

  // Lấy phần tử HTML
  const dataElement = document.getElementById("data-preloaded");
  // Kiểm tra nếu phần tử tồn tại
  if (dataElement) {
    // Lấy dữ liệu từ thuộc tính data-preloaded
    const preloadedDataString = dataElement.getAttribute("data-preloaded");
    // Chuyển đổi chuỗi JSON từ dạng mã hóa sang đối tượng JavaScript
    const preloadedData = JSON.parse(preloadedDataString);
    if (preloadedData.currentUser) {
      // Chuyển đổi chuỗi JSON từ dạng mã hóa sang đối tượng JavaScript
      // const currentUser = JSON.parse(preloadedData.currentUser);
      canPlay = true;
    }
  } else {
    console.error('Không tìm thấy phần tử với id "data-preloaded"');
  }

  // Lặp lại sau 10 giây
  setTimeout(findAndLogIframes, 10000);
}

// Kích hoạt khi trang tải xong
document.addEventListener("DOMContentLoaded", findAndLogIframes);
