# **熟練 React.js**

## 大綱

1. 主線任務說明
2. 實作步驟
    1. 登入狀態檢查與權限驗證
    2. 產品新增 / 編輯 / 刪除按鈕
    3. 建立 Modal 表單
    4. 表單狀態管理
    5. CRUD API 串接
    6. 初始化設定

## 1. 主線任務說明

第三週同學可多練習 React.js 的各項語法及指令，目標以串接 API 完成一頁式的產品新增、刪除、修改的頁面。

請使用 **vite** 完成以下需求：

- 可以新增、編輯、刪除商品
- 商品啟用、關閉可以使用不同的顏色標示

**課程 API 相關網址：**

- [註冊連結、測試管理平台](https://ec-course-api.hexschool.io/)
- [API 文件](https://hexschool.github.io/ec-courses-api-swaggerDoc/)

登入頁面 API

- [登入串接 POST API](https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E7%99%BB%E5%85%A5%E5%8F%8A%E9%A9%97%E8%AD%89/post_v2_admin_signin)
- [驗證登入串接 POST API](https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E7%99%BB%E5%85%A5%E5%8F%8A%E9%A9%97%E8%AD%89/post_v2_api_user_check)

產品頁面 API

- [取得產品資料串接 GET API](https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E7%AE%A1%E7%90%86%E6%8E%A7%E5%88%B6%E5%8F%B0%20-%20%E7%94%A2%E5%93%81%20(Products)/get_v2_api__api_path__admin_products)
- [新增產品資料串接 POST API](https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E7%AE%A1%E7%90%86%E6%8E%A7%E5%88%B6%E5%8F%B0%20-%20%E7%94%A2%E5%93%81%20(Products)/post_v2_api__api_path__admin_product)
- [刪除產品資料串接 DELETE API](https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E7%AE%A1%E7%90%86%E6%8E%A7%E5%88%B6%E5%8F%B0%20-%20%E7%94%A2%E5%93%81%20(Products)/delete_v2_api__api_path__admin_product__id_)
- [編輯產品資料串接 PUT API](https://hexschool.github.io/ec-courses-api-swaggerDoc/#/%E7%AE%A1%E7%90%86%E6%8E%A7%E5%88%B6%E5%8F%B0%20-%20%E7%94%A2%E5%93%81%20(Products)/put_v2_api__api_path__admin_product__id_)

頁面模板

- [登入到產品頁面的頁面模板](https://codepen.io/hexschool/pen/PwYjYQX)（因這週尚未教到路由，所以會先用 三元運算子 切換畫面呈現）

作業須符合此[作業規範](https://hackmd.io/XbKPYiE9Ru6G0sAfB5PBJw)

每週主線任務範例：https://github.com/hexschool/react-training-chapter-2025

### **挑戰等級**

- LV 1｜參考程式碼範例，並重新撰寫及補上註解（禁止複製範例程式碼）
- LV 2｜後台登入頁面＋串接新增、刪除、編輯 API 完成頁面功能
- LV 3｜完成 LV2 並且建立超過 10 個正式產品內容（不使用假資料）

![image.png](attachment:79ca2133-5ed4-415f-a06c-3e567c5992fc:image.png)

![image.png](attachment:b76a3cb9-dfd5-47eb-b7e8-dd680fd16081:image.png)

### 流程

```jsx
1. 頁面載入
   - 檢查 Cookie Token
   - 驗證管理員權限
   - 載入產品列表

2. 使用者操作
   - 點擊「新增 / 編輯 / 刪除」
   - 設定 modalType
   - 開啟對應 Modal

3. Modal 操作
   - 編輯表單狀態（templateData）
   - 送出後呼叫對應 API
   - 成功後關閉 Modal 並重新載入資料
```

### 產品管理 API

- **取得產品列表**: `GET ${API_BASE}/api/${API_PATH}/admin/products`
- **新增產品**: `POST ${API_BASE}/api/${API_PATH}/admin/product`
- **更新產品**: `PUT ${API_BASE}/api/${API_PATH}/admin/product/${id}`
- **刪除產品**: `DELETE ${API_BASE}/api/${API_PATH}/admin/product/${id}`

### 專案結構說明

第三週的實作將**延續第二週所建立的專案結構**

- 專案資料夾結構與第二週相同
- 僅在既有基礎上新增「產品管理」相關功能
- 請直接在第二週完成的專案中繼續開發

```
week3/
├── src/
│   ├── App.jsx        # 主元件
│   ├── main.jsx       # 應用程式入口
│   └── assets/
│       └── style.css  # 樣式
├── index.html         # HTML 模板
├── package.json       # 專案設定
└── vite.config.js     # Vite 設定
```

## 2. 實作步驟

### 登入狀態檢查與權限驗證

```jsx
// 檢查管理員權限
const checkAdmin = async () => {
  try {
    await axios.post(`${API_BASE}/api/user/check`);
    setIsAuth(true);
    getProductData(); // 載入產品資料
  } catch (err) {
    console.log("權限檢查失敗：", err.response?.data?.message);
    setIsAuth(false);
  }
};
```

- 當頁面重整時，axios 的預設 headers 會被清空，此時需要從 cookie 中重新讀取 token 並設置
    
    ```jsx
    [頁面重整或載入]
           ↓
    [useEffect 啟動]
           ↓
    [檢查 cookie 是否有 hexToken]
           ↓
      [有] → 設置 axios 的 Authorization header → 呼叫 checkLogin API
           ↓
    [checkLogin 成功] → 更新 isAuth 為 true → 呼叫 getProducts 載入產品列表
           ↓
    [完成]
           ↓
    [checkLogin 失敗] → 更新 isAuth 為 false → 顯示登入畫面
    ```
    

```jsx
useEffect(() => {
  // 檢查登入狀態
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("hexToken="))
    ?.split("=")[1];

  if (token) {
    axios.defaults.headers.common.Authorization = token;
  }

  // 檢查管理員權限並載入資料
  checkAdmin();
}, []);
```

### 產品增加編輯/刪除按鈕

[button-group](https://getbootstrap.com/docs/5.3/components/button-group/#basic-example)

```jsx
<div className="btn-group">
  <button
    type="button"
    className="btn btn-outline-primary btn-sm"
    onClick={() => openModal(product, "edit")}
  >
    編輯
  </button>
  <button
    type="button"
    className="btn btn-outline-danger btn-sm"
    onClick={() => openModal(product, "delete")}
  >
    刪除
  </button>
</div>
```

### 產品啟用狀態顯示

```jsx
<span className={`${item.is_enabled ? 'text-success' : ''}`}>
  {item.is_enabled ? '啟用' : '未啟用'}
</span>
```

### 新增產品按鈕

```jsx
// 產品管理頁面
{
  isAuth && (
    <div className="container">
      {/* 新增產品按鈕 */}
      <div className="text-end mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openModal({}, "create")}>
          建立新的產品
        </button>
      </div>

      {/* 產品列表表格 */}
    </div>
  );
}
```

### 建立 Modal 表單

Bootstrap Modal 是**直接操作 DOM 的套件**，而 React 本身不建議直接操作 DOM

- React 負責：資料狀態（templateData、modalType）
- Bootstrap 負責：畫面顯示 / 隱藏

useRef 的角色

- 保存同一個 Modal 實體
- 不會因 re-render 被重建

[bootstrap modal 方法](https://getbootstrap.com/docs/5.3/components/modal/#methods)

- 補充：[Bootstrap Modal 的新增問題](https://github.com/twbs/bootstrap/issues/41005)
    
    Bootstrap Modal 關閉時不會主動處理焦點
    
    在 React 專案中，Modal 內的元素可能立刻被卸載
    
    如果焦點還留在裡面，會造成無障礙錯誤
    
    所以在 hide.bs.modal 時手動 blur() 是必要的防護措施
    
    ```jsx
    modal.addEventListener('hide.bs.modal', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    ```
    

```jsx
import * as bootstrap from "bootstrap";

// useRef 建立對 DOM 元素的參照
const productModalRef = useRef(null);

// 在 useEffect 中初始化
useEffect(() => {
  productModalRef.current = new bootstrap.Modal("#productModal");
  
  // Modal 關閉時移除焦點
  document
    .querySelector("#productModal")
    .addEventListener("hide.bs.modal", () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
}, []);

// 使用 ref 控制 Modal
const openModal = () => {
  productModalRef.current.show();
};
```

- [Modal](https://getbootstrap.com/docs/5.3/components/modal/#live-demo) 模板
    
    ```jsx
    <div
      id="productModal"
      className="modal fade"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
      >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div className="modal-header bg-dark text-white">
            <h5 id="productModalLabel" className="modal-title">
              <span>新增產品</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-sm-4">
                <div className="mb-2">
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">
                      輸入圖片網址
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      className="form-control"
                      placeholder="請輸入圖片連結"
                      />
                  </div>
                  <img className="img-fluid" src={null} alt="主圖" />
                </div>
                <div>
                  <div>
    					      <label htmlFor="imageUrl" className="form-label">
    					        輸入圖片網址
    					      </label>
    					      <input
    					        type="text"
    					        className="form-control"
    					        // placeholder={`圖片網址${index + 1}`}
    					      />
    					      <img
                      className="img-fluid"
                      src={null}
                      // alt={`副圖${index + 1}`}
                    />
    					    </div>
                  <button className="btn btn-outline-primary btn-sm d-block w-100">
                    新增圖片
                  </button>
                </div>
                <div>
                  <button className="btn btn-outline-danger btn-sm d-block w-100">
                    刪除圖片
                  </button>
                </div>
              </div>
              <div className="col-sm-8">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">標題</label>
                  <input
                    name="title"
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="請輸入標題"
                    />
                </div>
    
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="category" className="form-label">分類</label>
                    <input
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                      />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="unit" className="form-label">單位</label>
                    <input
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                      />
                  </div>
                </div>
    
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="origin_price" className="form-label">原價</label>
                    <input
                      name="origin_price"
                      id="origin_price"
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="請輸入原價"
                      />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="price" className="form-label">售價</label>
                    <input
                      name="price"
                      id="price"
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="請輸入售價"
                      />
                  </div>
                </div>
                <hr />
    
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">產品描述</label>
                  <textarea
                    name="description"
                    id="description"
                    className="form-control"
                    placeholder="請輸入產品描述"
                    ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">說明內容</label>
                  <textarea
                    name="content"
                    id="content"
                    className="form-control"
                    placeholder="請輸入說明內容"
                    ></textarea>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      name="is_enabled"
                      id="is_enabled"
                      className="form-check-input"
                      type="checkbox"
                      />
                    <label className="form-check-label" htmlFor="is_enabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              data-bs-dismiss="modal"
              onClick={() => closeModal()}
              >
              取消
            </button>
            <button type="button" className="btn btn-primary">確認</button>
          </div>
        </div>
      </div>
    </div>
    ```
    

### 為什麼只用一個 Modal？

**狀態驅動畫面**的典型應用

- Modal 本身只負責「顯示」
- 行為由 `modalType` 決定（create / edit / delete）
- 可以避免：
    - HTML 結構大量重複
    - 狀態同步困難
    - 維護成本過高

```jsx
// ❌ 錯誤：同一功能寫多個 Modal
<CreateModal />
<EditModal />
```

```jsx
// ⭕ 正確設計：一個 Modal + 狀態控制行為
modalType === "create"
modalType === "edit"
```

### 建立狀態管理

建立初始化的資料 `INITIAL_TEMPLATE_DATA` 

```jsx
const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};
```

開啟 Modal 前，一定要先設定 templateData，避免 modal 第一次渲染時會 undefined 出錯

```jsx
function App() {
  // Modal 控制相關狀態
  const productModalRef = useRef(null);
  const [modalType, setModalType] = useState(""); // "create", "edit", "delete"

  // 產品表單資料模板
  const [templateData, setTemplateData] = useState(INITIAL_TEMPLATE_DATA);

  // 產品列表狀態 (延續第二週)
  // ...

  // 登入狀態 (延續第二週)
  // ...
}
```

### 實作 Modal 控制邏輯

- 資料先準備好，再開 Modal
- Modal 本身不存資料
- 同一個 Modal，用狀態切換行為

```jsx
// 開啟 Modal 函式
const openModal = (product, type) => {
  setTemplateData((prevData) => ({
    ...prevData,
    ...product,
  }));

  // 設定 Modal 類型並顯示
  setModalType(type);
  productModalRef.current.show();
};

// 關閉 Modal 函式
const closeModal = () => {
  productModalRef.current.hide();
};
```

### 實作表單處理

**狀態更新**

```jsx
// ❌ 錯誤：直接修改 state 物件
templateData.title = e.target.value;
setTemplateData(templateData);
```

- 陣列是參考型別，實際上沒有建立新陣列
- React 無法偵測到 state 內容被改變
- 破壞 React「不可變資料（immutable）」的設計原則

```jsx
// ⭕ 正確：用 setState 並回傳新物件
setTemplateData(prev => ({
  ...prev,
  title: e.target.value
}));
```

- 陣列、物件都要「複製後再改」
- 建立新物件 → React 才知道要 re-render
- 表單狀態更新的標準寫法

```jsx
// 更新陣列
const handleImageChange = (index, value) => {
  setTemplateData((prevData) => {
    const newImages = [...prevData.imagesUrl]; // 複製陣列
    newImages[index] = value; // 更新特定索引
    return { ...prevData, imagesUrl: newImages }; // 回傳新狀態
  });
};
```

**共用一個表單處理函式**

```jsx
// ❌ 錯誤：表單欄位寫死多個 onChange（重複且難維護）
<input onChange={(e) => setTitle(e.target.value)} />
<input onChange={(e) => setPrice(e.target.value)} />
<input onChange={(e) => setCategory(e.target.value)} />
```

- 每新增一個欄位就要多寫一個 handler
- 程式碼重複、難以維護
- 不利於後續擴充表單

```jsx
// ⭕ 正確：共用一個表單處理函式
<input id="title" onChange={handleModalInputChange} />
<input id="price" onChange={handleModalInputChange} />
<input id="category" onChange={handleModalInputChange} />

// 表單輸入處理
const handleModalInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setTemplateData((prevData) => ({
    ...prevData,
    [name]: type === "checkbox" ? checked : value,
  }));
};
```

- `name` 對應 state 的 key
- 一支 handler 控制整個表單
- 是實務中最常見的寫法

imagesUrl 使用「空字串」當作下一個圖片輸入框的佔位

- 有輸入 → 自動新增下一格
- 最後一格是空白 → 不送 API
- 最多限制 5 張圖片

```jsx
// 圖片處理
const handleImageChange = (index, value) => {
  setTemplateData((prevData) => {
    const newImages = [...prevData.imagesUrl];
    newImages[index] = value;

    // 填寫最後一個空輸入框時，自動新增空白輸入框
    if (
      value !== "" &&
      index === newImages.length - 1 &&
      newImages.length < 5
    ) {
      newImages.push("");
    }

    // 清空輸入框時，移除最後的空白輸入框
    if (
        value === "" &&
        newImages.length > 1 &&
        newImages[newImages.length - 1] === ""
      ) {
      newImages.pop();
    }

    return { ...prevData, imagesUrl: newImages };
  });
};

// 新增圖片
const handleAddImage = () => {
  setTemplateData((prevData) => ({
    ...prevData,
    imagesUrl: [...prevData.imagesUrl, ""],
  }));
};

// 移除圖片
const handleRemoveImage = () => {
  setTemplateData((prevData) => {
    const newImages = [...prevData.imagesUrl];
    newImages.pop();
    return { ...prevData, imagesUrl: newImages };
  });
};
```

- 補充：畫面上新增圖片 & 刪除圖片 按鈕可以增加卡控
    - 新增圖片：
        - 增加最多五張的限制 `templateData.imagesUrl.length < 5`
        - 最後一個 input 有值才顯示(避免一直按新增) `templateData.imagesUrl[templateData.imagesUrl.length - 1] !== ""`
    - 刪除圖片：
        - imagesUrl 陣列有值才顯示 `templateData.imagesUrl.length >= 1`

### 實作 CRUD API 操作

不用為新增 / 編輯寫兩套表單，而是用 modalType 決定 API 行為

```jsx
if (modalType === "edit") { ... }
else if (modalType === "create") { ... }
```

- 取得產品列表( 第二週）`GET ${API_BASE}/api/${API_PATH}/admin/products`
    
    ```jsx
    // 取得產品列表
    const getProductData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/admin/products`
        );
        setProducts(response.data.products);
        console.log("產品列表載入成功：", response.data.products);
      } catch (err) {
        console.error("取得產品列表失敗：", err.response?.data?.message);
        alert("取得產品列表失敗：" + (err.response?.data?.message || err.message));
      }
    };
    ```
    
- 新增/更新產品 `POST ${API_BASE}/api/${API_PATH}/admin/product` / `PUT ${API_BASE}/api/${API_PATH}/admin/product/${id}` (注意資料格式)
    
    ```jsx
    // 新增/更新產品
    const updateProductData = async (id) => {
      // 決定 API 端點和方法
      let url;
      let method;
    
      if (modalType === "edit") {
        url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
        method = "put";
      } else if (modalType === "create") {
        url = `${API_BASE}/api/${API_PATH}/admin/product`;
        method = "post";
      }
    
      // 準備要送出的資料（注意格式！）
      const productData = {
        data: {
          ...templateData,
          origin_price: Number(templateData.origin_price), // 轉換為數字
          price: Number(templateData.price), // 轉換為數字
          is_enabled: templateData.is_enabled ? 1 : 0, // 轉換為數字
          imagesUrl: templateData.imagesUrl.filter((url) => url !== ""), // 過濾空白
        },
      };
    
      try {
        let response;
        if (method === "put") {
          response = await axios.put(url, productData);
          console.log("產品更新成功：", response.data);
          alert("產品更新成功！");
        } else {
          response = await axios.post(url, productData);
          console.log("產品新增成功：", response.data);
          alert("產品新增成功！");
        }
    
        // 關閉 Modal 並重新載入資料
        closeModal();
        getProductData();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error(`${modalType === "edit" ? "更新" : "新增"}失敗：`, errorMsg);
        alert(`${modalType === "edit" ? "更新" : "新增"}失敗：${errorMsg}`);
      }
    };
    ```
    
- 刪除產品 `DELETE ${API_BASE}/api/${API_PATH}/admin/product/${id}`
    
    ```jsx
    // 刪除產品
    const deleteProductData = async (id) => {
      try {
        const response = await axios.delete(
          `${API_BASE}/api/${API_PATH}/admin/product/${id}`
        );
        console.log("產品刪除成功：", response.data);
        alert("產品刪除成功！");
    
        // 關閉 Modal 並重新載入資料
        closeModal();
        getProductData();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error("刪除失敗：", errorMsg);
        alert("刪除失敗：" + errorMsg);
      }
    };
    ```
    
- 刪除 modal 模板
    
    ```jsx
    {/* modal-header 顏色提示 */}
    <div className="modal-header bg-danger text-white">
      <h1 className="modal-title fs-5" id="productModalLabel">
        <span>刪除產品</span>
      </h1>
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="modal"
        aria-label="Close"
      ></button>
    </div>
    
    {/* modal-body 顯示內容 */}
    <div className="modal-body">
    	<p className="fs-4">
    	  確定要刪除
    	  <span className="text-danger">{templateData.title}</span>嗎？
    	</p>
    </div>
    
    {/* modal-footer 刪除按鈕 */}
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-danger"
      >
        刪除
      </button>
    </div>
    ```
    

### 初始化設定

useEffect 只在元件初次 render 時執行：

1. 設定 Authorization
    
    課程 API Authorization Header 直接放 token
    
2. 初始化 Modal（避免第一次開啟失敗）
    
    避免每次 re-render 重複建立 Modal 實體
    
3. 驗證登入並載入資料

```jsx
useEffect(() => {
  // 檢查登入狀態
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("hexToken="))
    ?.split("=")[1];

  if (token) {
    axios.defaults.headers.common.Authorization = token;
  }

  // 初始化 Bootstrap Modal
  productModalRef.current = new bootstrap.Modal("#productModal", {
    keyboard: false,
  });

  // Modal 關閉時移除焦點
  document
    .querySelector("#productModal")
    .addEventListener("hide.bs.modal", () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });

  // 檢查管理員權限並載入資料
  checkAdmin();
}, []);
```

- [keyboard: false](https://getbootstrap.com/docs/5.3/components/modal/#options) 禁用 `Esc` 鍵關閉模態框，通常用於需要強制使用者完成操作的情境
- 監聽 `hide.bs.modal` 並移除焦點，可以確保關閉後的狀態是乾淨的，避免潛在的問題
