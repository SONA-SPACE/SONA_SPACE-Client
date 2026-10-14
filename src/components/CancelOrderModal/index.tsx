import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, List, Divider, message } from 'antd';
import { getOrderItems, cancelOrderProduct, type OrderItem } from '../../api/order';
import CancelProductModal from '../CancelProductModal';
import { getAuthToken } from '../../services/loginService';
import './styles.scss';

interface CancelOrderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => Promise<void>;
  loading?: boolean;
  orderHash?: string;
  orderId?: number;
}

const { TextArea } = Input;

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading = false,
  orderHash = '',
  orderId,
}) => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [cancelMode, setCancelMode] = useState<'full' | 'partial'>('full');
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [cancellingProduct, setCancellingProduct] = useState(false);

  // Load order items when modal opens
  useEffect(() => {
    if (visible && orderId) {
      loadOrderItems();
    }
  }, [visible, orderId]);

  const loadOrderItems = async () => {
    if (!orderId) return;
    
    try {
      setLoadingItems(true);
      const token = getAuthToken();
      if (!token) {
        message.error('Không tìm thấy token xác thực');
        return;
      }
      
      const response = await getOrderItems(orderId, token);
      setOrderItems(response.data.items);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
      console.error(error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values.reason);
      
      // Reset form sau khi submit thành công
      form.resetFields();
      setCancelMode('full');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCancelMode('full');
    setSelectedProduct(null);
    setShowProductModal(false);
    onCancel();
  };

  const handleCancelProduct = (item: OrderItem) => {
    setSelectedProduct(item);
    setShowProductModal(true);
  };

  const handleProductCancel = async (reason: string) => {
    if (!selectedProduct || !orderId) return;

    try {
      setCancellingProduct(true);
      const token = getAuthToken();
      if (!token) {
        message.error('Không tìm thấy token xác thực');
        return;
      }
      
      const response = await cancelOrderProduct(orderId, selectedProduct.item_id, reason, token);
      
      message.success(response.message);
      setShowProductModal(false);
      setSelectedProduct(null);
      
      // Reload order items
      await loadOrderItems();
      
    } catch (error: any) {
      message.error(error.message || 'Không thể hủy sản phẩm');
    } finally {
      setCancellingProduct(false);
    }
  };

  const cancellableItems = orderItems.filter(item => item.can_cancel);

  return (
    <>
      <Modal
        title="Hủy đơn hàng"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        className="cancel-order-modal"
      >
        <div className="modal-content">
          <div className="order-info">
            <p>
              <strong>Đơn hàng:</strong> #{orderHash}
            </p>
          </div>

          {/* Mode Selection */}
          <div className="cancel-mode-section">
            <h4>Chọn hình thức hủy:</h4>
            <div className="mode-options">
              <div 
                className={`mode-option ${cancelMode === 'full' ? 'active' : ''}`}
                onClick={() => setCancelMode('full')}
              >
                <div className="mode-header">
                  <strong>Hủy toàn bộ đơn hàng</strong>
                </div>
                <p>Hủy tất cả sản phẩm trong đơn hàng này</p>
              </div>
              <div 
                className={`mode-option ${cancelMode === 'partial' ? 'active' : ''}`}
                onClick={() => setCancelMode('partial')}
              >
                <div className="mode-header">
                  <strong>Hủy từng sản phẩm</strong>
                </div>
                <p>Chọn hủy một hoặc nhiều sản phẩm cụ thể</p>
              </div>
            </div>
          </div>

          <Divider />

          {cancelMode === 'partial' && (
            <div className="products-section">
              <h4>Danh sách sản phẩm có thể hủy:</h4>
              {loadingItems ? (
                <div className="loading-text">Đang tải...</div>
              ) : cancellableItems.length > 0 ? (
                <List
                  dataSource={cancellableItems}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          danger
                          onClick={() => handleCancelProduct(item)}
                        >
                          Hủy sản phẩm này
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                          />
                        }
                        title={item.product.name}
                        description={
                          <div>
                            <p>Số lượng: {item.quantity}</p>
                            <p>Giá: {item.price.toLocaleString('vi-VN')}₫</p>
                            {item.color && (
                              <p>Màu: {item.color.name}</p>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <p className="no-items">Không có sản phẩm nào có thể hủy trong đơn hàng này.</p>
              )}
            </div>
          )}

          {cancelMode === 'full' && (
            <>
              <div className="warning-section">
                <p className="warning-text">
                  ⚠️ Bạn có chắc chắn muốn hủy toàn bộ đơn hàng này không? Hành động này không thể hoàn tác.
                </p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item
                  label="Lý do hủy đơn hàng"
                  name="reason"
                  rules={[
                    { required: true, message: 'Vui lòng nhập lý do hủy đơn hàng' },
                    { min: 150, message: 'Lý do hủy đơn hàng phải có ít nhất 150 ký tự' },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Vui lòng mô tả chi tiết lý do bạn muốn hủy đơn hàng này (tối thiểu 150 ký tự)..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>

                <div className="help-text">
                  <p>
                    <strong>Lưu ý:</strong> Việc hủy đơn hàng sẽ được xem xét và xử lý trong vòng 24 giờ. 
                    Nếu đơn hàng đã được xác nhận hoặc đang trong quá trình vận chuyển, 
                    chúng tôi sẽ liên hệ với bạn để thông báo kết quả.
                  </p>
                </div>

                <div className="modal-actions">
                  <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                    Giữ đơn hàng
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    className="submit-button"
                    danger
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận hủy đơn hàng'}
                  </Button>
                </div>
              </Form>
            </>
          )}

          {cancelMode === 'partial' && (
            <div className="modal-actions">
              <Button onClick={handleCancel}>
                Đóng
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Product Cancel Modal */}
      <CancelProductModal
        visible={showProductModal}
        onCancel={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleProductCancel}
        loading={cancellingProduct}
        product={selectedProduct ? {
          id: selectedProduct.item_id,
          name: selectedProduct.product.name,
          image: selectedProduct.product.image,
          price: selectedProduct.price,
          quantity: selectedProduct.quantity,
          color: selectedProduct.color
        } : undefined}
        orderHash={orderHash}
      />
    </>
  );
};

export default CancelOrderModal;
