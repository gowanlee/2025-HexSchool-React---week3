import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import * as bootstrap  from 'bootstrap';  

import './assets/style.css';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

// 建立初始化的資料
const INITIAL_TEMPLATE_DATA = {
  id: '',
  title: '',
  category: '',
  origin_price: '',
  price: '',
  unit: '',
  description: '',
  content: '',
  is_enabled: false,
  imageUrl: '',
  imagesUrl: [],
}

function App() {
  // 表單資料狀態
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  // 登入狀態管理（控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);

  // 產品資料狀態
  const [products, setProducts] = useState([]);

  // 產品表單資料模板
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);

  // Modal 控制相關狀態
  const [modalType, setModalType] = useState(''); // "create", "edit", "delete"
  const productModalRef = useRef(null);

  // 解構取得input裡的name 及 value 寫入formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,    // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
  }

  // 解構取得 修改modal input裡的 value 寫入templateProduct
  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTemplateProduct((preData) => ({
      ...preData,    // 保留原有屬性
      [name]: type === 'checkbox' ? checked : value, // 更新特定屬性(type如果是checkbox就打勾，如不是就取值)
    }));
  }

  // 圖片處理
  // 取得 修改 modal input 裡副圖的 index, value 寫入templateProduct
  const handleModalImagesChange = (index, value) => {
    setTemplateProduct((preImage) => {
      const newImage = [...preImage.imagesUrl];
      newImage[index] = value;
      
      // 當值不為空 && 不是最後一筆時 && 最多5張照片
      // 填寫最後一個空輸入框時，自動新增空白輸入框
      if (value !== '' && index === newImage.length - 1 && newImage.length < 5) {
        newImage.push('');
      }

      // 當值為空 && 照片至少有一張 && 修改的值是最後一筆
      // 清空輸入框時，移除最後的空白輸入框
      if (value === '' && newImage.length > 1 && newImage[newImage.length - 1] === '') {
        newImage.pop();
      }

      return {
        ...preImage,
        imagesUrl: newImage
      };
    });
  }

  // modal 新增圖片
  const handleModalAddImage = () => {
    setTemplateProduct((preImage) => {
      const newImage = [...preImage.imagesUrl];

      // 在五筆內才能新增圖片
      if (templateProduct.imagesUrl.length < 5) {
        newImage.push(''); // 在圖片陣列中新增一筆在陣列最後面
      }

      return {
        ...preImage,
        imagesUrl: newImage
      };
    });
  }

  // modal 刪除圖片
  const handleModalRemoveImage = () => {
    setTemplateProduct((preImage) => {
      const newImage = [...preImage.imagesUrl];
      newImage.pop(); // 刪除圖片陣列中最後一筆
      return {
        ...preImage,
        imagesUrl: newImage
      };
    });
  }

  // modal 開啟 函式
  const openModal = (type, product) => {
    setTemplateProduct((prevData) => ({
    ...prevData,
    ...product,
    }));

    // 設定 Modal 類型並顯示
    setModalType(type);
    productModalRef.current.show();
  }

  // modal 關閉
  const closeModal = () => {
    productModalRef.current.hide();
  }

  // 串接登入API
  const onSubmit = async(e) => {
    try {
      e.preventDefault(); // 解除預設事件
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);

      const { token, expired } = res.data; // 解構 token, expired

      document.cookie = `hexToken=${token};expires=${new Date(expired)}`; // 設定 cookie
      axios.defaults.headers.common['Authorization'] = token; // 修改實體建立時所指派的預設配置（登入成功後，API請求都會自動帶上token）

      setIsAuth(true); // 登入狀態改為 true
      getProducts(); // 取得產品列表資料
    } catch (error) {
      setIsAuth(false); // 登入狀態改為 false
      console.log(error.response.data.message);
    }
  }

  // 串接產品列表 API
  const getProducts = async() => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products); // 寫入產品列表
      console.log(res);
    } catch (error) {
      console.log(error.response.data.message);
    }
  }

  // 串接新增/更新產品列表 API
  const updateProduct = async(id) => {
    // 決定 API 端點和方法
    let url;
    let method;

    if (modalType === 'edit') {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = 'put';
    } else if (modalType === 'create') {
      url = `${API_BASE}/api/${API_PATH}/admin/product`;
      method = 'post';
    }

    // 準備要送出的資料
    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price), // 轉換為數字
        price: Number(templateProduct.price), // 轉換為數字
        is_enabled: templateProduct.is_enabled ? 1 : 0, // 轉換為數字
        imagesUrl: templateProduct.imagesUrl.filter((url) => url !== ''), // 過濾空白
      },
    };

    try {
      await axios[method](url, productData);

      closeModal();  // 關閉 Modal 並重新載入資料
      getProducts(); // 取得產品列表
    } catch (error) {
      console.log(error)
    }
  }

  // 串接刪除產品 API
  const deleteProduct = async(id) => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);

      closeModal();  // 關閉 Modal 並重新載入資料
      getProducts(); // 取得產品列表
    } catch (error) {
      console.log(error);
    }
  }

  // 初始化
  useEffect(() => {
    // 讀取 cookie
    const token = document.cookie
      .split(';')
      .find((row) => row.startsWith('hexToken='))
      ?.split('=')[1];

    // 如果有拿到 token 再帶入headers   
    if (token) {
      axios.defaults.headers.common['Authorization'] = token; // 修改實體建立時所指派的預設配置（登入成功後，API請求都會自動帶上token）
    }

    // 綁定 modal 到 dom 元素
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false
    })

    // Modal 關閉時移除焦點
    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
    });
    
    // 初始化搭配useEffect串接登入驗證 API
    // 檢查管理員權限
    const checkAdmin = async() => {
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
        getProducts(); // 載入產品資料
      } catch (error) {
        console.log(error.response.data.message);
      }
    }

    checkAdmin();
  }, [])

  return (
    <>
      {!isAuth ? 
      (<div className="container login">
        <h2>請先登入</h2>
        <div>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" name="username" placeholder="name@example.com" defaultValue={formData.username} onChange={(e) => handleInputChange(e)} />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating mb-3">
              <input type="password" className="form-control" name="password" placeholder="Password" defaultValue={formData.password} onChange={(e) => handleInputChange(e)}/>
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100">登入</button>
          </form>
        </div>
      </div>) : 
      (<div className="container">
        <h2>產品列表</h2>

        {/* 新增產品按鈕 */}
        <div className="text-end mt-4">
          <button type="button" className="btn btn-primary" onClick={()=> openModal('create', INITIAL_TEMPLATE_DATA)}>建立新的產品</button>
        </div>

        {/* 產品列表表格 */}
        <table className="table">
          <thead>
            <tr>
              <th>分類</th>
              <th>產品名稱</th>
              <th>原價</th>
              <th>售價</th>
              <th>是否啟用</th>
              <th>編輯</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.category}</td>
                <td>{product.title}</td>
                <td>{product.origin_price}</td>
                <td>{product.price}</td>
                <td className={`${product.is_enabled ? ('text-success') : ('text-black-50')}`}>{product.is_enabled ? '啟用' : '未啟用'}</td>
                <td>
                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>{openModal('edit', product)}}>編輯</button>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openModal('delete', product)}>刪除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>)
      } 

      {/* Modal */}
      <div
        id="productModal"
        className="modal fade"
        tabIndex="-1"
        aria-labelledby="productModalLabel"
        aria-hidden="true"
        ref={productModalRef}
        >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            {/* modal-header 顏色提示 */}
            <div className={`modal-header bg-${modalType === 'delete' ? 'danger' : 'dark'} text-white`}>
              <h5 id="productModalLabel" className="modal-title">
                <span>{modalType === 'edit' ? '編輯產品' :
                  modalType === 'delete' ? '刪除產品' : '新增產品'}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ></button>
            </div>
            <div className="modal-body">
              {/* modal-body 顯示內容 */}
              {
                modalType === 'delete' ? (
                  <p className="fs-4">
                    確定要刪除
                    <span className="text-danger"> {templateProduct.title} </span>嗎？
                  </p>
                ) : (
                  <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="imageUrl" className="form-label">
                          輸入圖片網址<span className='text-danger'>*</span>
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="請輸入圖片連結"
                          value={templateProduct.imageUrl}
                          onChange={(e) => handleModalInputChange(e)}
                          />
                      </div>
                      {/* 如果有網址就顯示沒有就不用顯示 */}
                      {templateProduct.imageUrl && (<img className="img-fluid" src={templateProduct.imageUrl} alt="主圖" />)}
                    </div>
                    <div>
                      {
                        templateProduct.imagesUrl.map((url, index) => (
                          <div key={index}>
                          <label htmlFor="imageUrl" className="form-label">
                            輸入圖片網址
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`圖片網址${index + 1}`}
                            value={url}
                            onChange={(e) => handleModalImagesChange(index, e.target.value)}
                          />
                          {url && (<img
                            className="img-fluid"
                            src={url}
                            alt={`副圖${index + 1}`}
                          />)}
                        </div>
                      ))}
                      {/* 最後一個input有值 且 圖片少於5張內 才顯示新增圖片按鈕 */}
                      {templateProduct.imagesUrl[templateProduct.imagesUrl.length - 1] !== '' && templateProduct.imagesUrl.length < 5 && (<button type="button" className="btn btn-outline-primary btn-sm d-block w-100" onClick={() => handleModalAddImage()}>
                        新增圖片
                      </button>)}
                    </div>
                    <div>
                      {/* imagesUrl 陣列有值時才顯示刪除按鈕 */}
                      {templateProduct.imagesUrl.length >= 1 && (<button type="button" className="btn btn-outline-danger btn-sm d-block w-100" onClick={() => handleModalRemoveImage()}>
                        刪除圖片
                      </button>)}
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">標題<span className='text-danger'>*</span></label>
                      <input
                        name="title"
                        id="title"
                        type="text"
                        className="form-control"
                        placeholder="請輸入標題"
                        value={templateProduct.title}
                        onChange={(e) => handleModalInputChange(e)}
                        />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="category" className="form-label">分類<span className='text-danger'>*</span></label>
                        <input
                          name="category"
                          id="category"
                          type="text"
                          className="form-control"
                          placeholder="請輸入分類"
                          value={templateProduct.category}
                          onChange={(e) => handleModalInputChange(e)}
                          />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label">單位<span className='text-danger'>*</span></label>
                        <input
                          name="unit"
                          id="unit"
                          type="text"
                          className="form-control"
                          placeholder="請輸入單位"
                          value={templateProduct.unit}
                          onChange={(e) => handleModalInputChange(e)}
                          />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label htmlFor="origin_price" className="form-label">原價<span className='text-danger'>*</span></label>
                        <input
                          name="origin_price"
                          id="origin_price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={templateProduct.origin_price}
                          onChange={(e) => handleModalInputChange(e)}
                          />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label">售價<span className='text-danger'>*</span></label>
                        <input
                          name="price"
                          id="price"
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={templateProduct.price}
                          onChange={(e) => handleModalInputChange(e)}
                          />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">產品描述<span className='text-danger'>*</span></label>
                      <textarea
                        name="description"
                        id="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={templateProduct.description}
                        onChange={(e) => handleModalInputChange(e)}
                        ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">說明內容<span className='text-danger'>*</span></label>
                      <textarea
                        name="content"
                        id="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={templateProduct.content}
                        onChange={(e) => handleModalInputChange(e)}
                        ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          name="is_enabled"
                          id="is_enabled"
                          className="form-check-input"
                          type="checkbox"
                          checked={templateProduct.is_enabled}
                          onChange={(e)=> handleModalInputChange(e)}
                          />
                        <label className="form-check-label" htmlFor="is_enabled">
                          是否啟用
                        </label>
                      </div>
                    </div>
                  </div>
                  </div>
                )
              }
            </div>
            <div className="modal-footer">
              {/* modal-footer 按鈕 */}
              {
                modalType === 'delete' ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteProduct(templateProduct.id)}
                  >
                    刪除
                  </button>
                ) : (
                  <>
                    <button
                    type="button"
                    className="btn btn-outline-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => closeModal()}
                    >
                    取消
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => updateProduct(templateProduct.id)}>確認</button>
                  </>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
