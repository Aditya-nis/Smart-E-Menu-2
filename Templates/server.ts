import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve static folders directly if requested
  app.use('/css', express.static(path.join(process.cwd(), 'css')));
  app.use('/js', express.static(path.join(process.cwd(), 'js')));
  app.use('/images', express.static(path.join(process.cwd(), 'images')));
  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

  // Convenience API routes for live order sharing between customer & kitchen if needed
  let ordersStore: any[] = [];

  app.get('/api/orders', (req, res) => {
    res.json({ success: true, orders: ordersStore });
  });

  app.post('/api/orders', (req, res) => {
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Received', // Received, Accepted, Preparing, Cooking, Ready, Served, Completed
      priority: req.body.priority || 'Normal',
      tableNumber: req.body.tableNumber || 'Table 4',
      customerName: req.body.customerName || 'Guest User',
      items: req.body.items || [],
      specialInstructions: req.body.specialInstructions || 'None',
      subtotal: req.body.subtotal || 0,
      gst: req.body.gst || 0,
      discount: req.body.discount || 0,
      grandTotal: req.body.grandTotal || 0,
      paymentStatus: 'Pending',
      paymentMethod: 'UPI'
    };
    ordersStore.unshift(newOrder);
    res.json({ success: true, order: newOrder });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = ordersStore.find(o => o.id === id);
    if (order) {
      order.status = status;
      res.json({ success: true, order });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  });

  // URL rewrite helper for extensionless static html routing
  const htmlPages: Record<string, string> = {
    '': 'index.html',
    'index': 'index.html',
    'login': 'login.html',
    'signup': 'signup.html',
    'dashboard': 'dashboard.html',
    'menu': 'menu.html',
    'tables': 'tables.html',
    'cart': 'cart.html',
    'order-tracking': 'order-tracking.html',
    'kitchen-dashboard': 'kitchen-dashboard.html',
    'bill': 'bill.html',
    'profile': 'profile.html',
  };

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use((req, res, next) => {
      // Don't touch API routes or static assets with extensions (except .html)
      if (req.path.startsWith('/api/') || (req.path.includes('.') && !req.path.endsWith('.html'))) {
        return vite.middlewares(req, res, next);
      }

      const pathname = req.path.replace(/^\//, '').replace(/\.html$/, '');
      const targetHtml = htmlPages[pathname];

      if (targetHtml) {
        req.url = `/${targetHtml}`;
      }

      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    Object.entries(htmlPages).forEach(([route, file]) => {
      if (route) {
        app.get(`/${route}`, (req, res) => {
          res.sendFile(path.join(distPath, file));
        });
      }
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Menu Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
