// 游戏结束的弹框提示
function showToast(content) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: '游戏结束',
      content,
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: resolve
    })
  })
}

export {
  showToast
}
