
'use client';

import { useState } from 'react';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { FaShoppingCart, FaLock, FaCoins } from 'react-icons/fa';
import { SiTon } from 'react-icons/si';
import TONPayment from '@/components/payments/TONPayment';

export default function StorePage() {
  const [purchaseEnabled, setPurchaseEnabled] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 40,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [selectedPackage, setSelectedPackage] = useState(null);

  // بطاقات المتجر - سيتم إضافة بطاقات أمازون وغيرها هنا لاحقاً
  const digitalCards = [
    { id: 1, title: 'بطاقة Google Play', price: 1500, image: '/assets/icons/gplay.jpg', description: 'بطاقة بقيمة 10 دولار' }, // مسار مؤقت للصورة
    { id: 2, title: 'بطاقة iTunes', price: 1500, image: '/assets/icons/itunes.jpg', description: 'بطاقة بقيمة 10 دولار' }, // مسار مؤقت للصورة
    { id: 3, title: 'بطاقة Amazon $25', price: 3750, image: '/assets/icons/amazon_gift_card_25.png', description: 'بطاقة بقيمة 25 دولار' },
    { id: 4, title: 'بطاقة Amazon $100', price: 15000, image: '/assets/icons/amazon_gift_card_100.png', description: 'بطاقة بقيمة 100 دولار' },
    // { id: 5, title: 'بطاقة Steam', price: 2000, image: '/assets/steam.png', description: 'بطاقة بقيمة 15 دولار' },
    // { id: 6, title: 'بطاقة PlayStation', price: 3000, image: '/assets/playstation.png', description: 'بطاقة بقيمة 20 دولار' },
  ];

  // حزم التعدين وشراء العملات
  const miningPackages = [
    { id: 1, title: 'حزمة التعدين الأساسية', price: '0.1533', coins: 60, period: 'يومياً', description: 'زيادة معدل التعدين اليومي' }, // السعر الجديد: 1 دولار
    { id: 2, title: 'حزمة التعدين المتوسطة', price: '0.4599', coins: 90, period: 'يومياً', description: 'زيادة معدل التعدين اليومي' }, // السعر الجديد: 3 دولار
    { id: 3, title: 'حزمة التعدين المتقدمة', price: '0.7665', coins: 200, period: 'يومياً', description: 'زيادة معدل التعدين اليومي' }, // السعر الجديد: 5 دولار
    // { id: 4, title: 'شراء مباشر للعملات', price: '0.1', coins: 3000, period: 'مرة واحدة' }, // العنصر القديم، سيتم استبداله أو إضافته
    { id: 5, title: 'اشترِ 30,000 عملة سمارت', price: '0.1533', coins: 30000, period: 'مرة واحدة', description: 'شراء مباشر لـ 30,000 عملة' }, // العنصر الجديد: 1 دولار
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePaymentSuccess = (pkgId, amount) => {
    // في التطبيق الحقيقي، هنا سيتم تحديث رصيد المستخدم أو معدل التعدين بناءً على pkgId و amount
    console.log(`Payment successful for package ${pkgId}, amount ${amount}`);
    alert(`تم شراء العنصر بنجاح!`);
    setSelectedPackage(null);
    // يجب إضافة منطق تحديث رصيد العملات أو معدل التعدين هنا باستخدام Supabase
  };
const userId = '123'; // أو جلبه من Supabase أو السياق

  return (
    <div className="min-h-screen pb-20">
      {/* رأس الصفحة */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold gold-text">المتجر</h1>
      </header>

      {/* نافذة الدفع */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-background-dark rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold">تأكيد الشراء</h2>
            </div>
            <div className="p-4">
              <p className="mb-4">هل أنت متأكد من شراء "{selectedPackage.title}" مقابل {selectedPackage.price} TON؟</p>
              <TONPayment 
                packageId={selectedPackage.id}
                packageName={selectedPackage.title}
                packagePrice={selectedPackage.price} // السعر بعملة TON
                userId={userId} // 🔴 هذا هو المهم الآن
                onSuccess={(pkgId, amount) => handlePaymentSuccess(pkgId, amount)
                
                
                } // تمرير الدالة للتعامل مع النجاح
              />
            </div>
            <div className="p-4 border-t border-gray-700">
              <button 
                className="secondary-button w-full"
                onClick={() => setSelectedPackage(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* إشعار قفل الشراء للبطاقات الرقمية */}
      {!purchaseEnabled && (
        <div className="p-4">
          <div className="bg-background-dark border border-primary-gold rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FaLock className="text-primary-gold ml-2" />
              <h2 className="text-lg font-bold">شراء البطاقات الرقمية غير متاح حالياً</h2>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              يمكنك شراء البطاقات الرقمية بعد {countdown.days} يوم من تسجيلك
            </p>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-primary-gold h-2 rounded-full" 
                style={{ width: `${(41 - countdown.days) / 41 * 100}%` }} // تعديل لـ 41 يوم
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* حزم التعدين وشراء العملات */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">حزم التعدين وشراء العملات</h2>
        <div className="space-y-4">
          {miningPackages.map(pkg => (
            <div key={pkg.id} className="store-item">
              <div className="store-item-header">
                <h3 className="store-item-title">{pkg.title}</h3>
                <span className="store-item-price">
                  <SiTon className="inline ml-1" size={14} />
                  {pkg.price}
                </span>
              </div>
              <p className="store-item-description">
                {pkg.description} (+{pkg.coins} {pkg.period === 'يومياً' ? 'عملة/يوم' : 'عملة'})
              </p>
              <button 
                className="secondary-button w-full"
                onClick={() => handlePackageSelect(pkg)}
              >
                <SiTon size={16} />
                <span>شراء</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* البطاقات الرقمية - مقفلة لمدة 41 يوم */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">الجوائز والبطاقات الرقمية</h2>
        <div className="space-y-4">
          {digitalCards.map(card => (
            <div key={card.id} className="store-item">
              {/* إضافة الصورة هنا */}
               <img src={card.image} alt={card.title} className="w-full h-32 object-contain rounded-t-lg mb-2"/>
              <div className="store-item-header">
                <h3 className="store-item-title">{card.title}</h3>
                <span className="store-item-price">
                  <FaCoins className="inline ml-1" size={14} />
                  {card.price}
                </span>
              </div>
              <p className="store-item-description">{card.description}</p>
              <button 
                className={`primary-button w-full ${!purchaseEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!purchaseEnabled}
              >
                {!purchaseEnabled && <FaLock size={14} className="ml-1"/>}
                <FaShoppingCart size={16} />
                <span>شراء</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* شريط التنقل السفلي */}
      <BottomNavigation currentPath="/store" />
    </div>
  );
}

