import { useState } from 'react';
import axios from 'axios';

import './assets/style.css';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

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

  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState(null);

  // 解構取得input裡的name 及 value 寫入formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
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

  // 串接登入驗證 API
  const checkLogin = async() => {
    try {
      // 讀取 cookie
      const token = document.cookie
        .split(';')
        .find((row) => row.startsWith('hexToken='))
        ?.split('=')[1];
      axios.defaults.headers.common['Authorization'] = token; // 修改實體建立時所指派的預設配置（登入成功後，API請求都會自動帶上token）

      await axios.post(`${API_BASE}/api/user/check`);
    } catch (error) {
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
        <div className="row mt-5">
            <div className="col-md-6">
              <button type="button" className="btn btn-danger mb-5" onClick={() => checkLogin()}>確認是否登入</button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.title}</td>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>
                        {product.is_enabled ? '啟用' : '未啟用'}
                      </td>
                      <td>
                        <button className="btn btn-primary" onClick={() => {setTempProduct(product)}}>查看</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img src={tempProduct.imageUrl} className="card-img-top primary-image" alt={`${tempProduct.title} 主圖`} />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">{tempProduct.category}</span>
                    </h5>
                    <p className="card-text">商品描述：{tempProduct.description}</p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary"><del>{tempProduct.origin_price}</del></p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) => {
                        return (<img key={index} src={url} className="images" alt={`${tempProduct.title} 副圖`} />)
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
        </div>
      </div>)
      } 
    </>
  )
}

export default App
