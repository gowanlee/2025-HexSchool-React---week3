import { useEffect, useState } from 'react';
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

  // 初始化搭配useEffect串接登入驗證 API
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
    
    // 檢查管理員權限
    const checkAdmin = async() => {
      try {
        const res = await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
        getProducts(); // 載入產品資料
      } catch (error) {
        console.log(error.response.data.message);
      }
    }

    checkAdmin();
  }, [])

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
        <h2>產品列表</h2>
        
        {/* 新增產品按鈕 */}
        <div className="text-end mt-4">
          <button type="button" className="btn btn-primary">建立新的產品</button>
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
                <td className={`${product.is_enabled ? 'text-success' : 'text-black-50'}`}>{product.is_enabled ? '啟用' : '未啟用'}</td>
                <td>
                  <div className="btn-group" role="group" aria-label="Basic example">
                    <button type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                    <button type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>)
      } 
    </>
  )
}

export default App
