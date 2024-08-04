'use client';

import { useState, useEffect } from 'react';
import {
  Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, IconButton, InputBase, Card, CardContent, CardActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { firestore } from './firebase';
import {
  collection, doc, getDocs, query, setDoc, deleteDoc, getDoc, Timestamp
} from 'firebase/firestore';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const cardStyle = {
  minWidth: 275,
  margin: 1,
  boxShadow: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [searchTerm, setSearchTerm] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState({});

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async () => {
    if (itemName.trim() === '') {
      alert('Item name cannot be empty');
      return;
    }

    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);
    const expiryDate = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 week from now
    if (docSnap.exists()) {
      const { quantity, weight, unit } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, weight, unit, expiry: expiryDate }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1, weight: itemWeight, unit: weightUnit, expiry: expiryDate });
    }
    await updateInventory();
    handleClose();
  };

  const addItemByName = async (name) => {
    if (!name) {
      alert('Item name cannot be empty');
      return;
    }

    const docRef = doc(collection(firestore, 'inventory'), name);
    const docSnap = await getDoc(docRef);
    const expiryDate = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 week from now
    if (docSnap.exists()) {
      const { quantity, weight, unit } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, weight, unit, expiry: expiryDate }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1, weight: itemWeight, unit: weightUnit, expiry: expiryDate });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, weight, unit, expiry } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1, weight, unit, expiry }, { merge: true });
      }
    }
    await updateInventory();
  };

  const handleDelete = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setItemName('');
    setItemWeight('');
    setWeightUnit('kg');
    setOpen(false);
  };

  const handleEditOpen = (item) => {
    setEditItem(item);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const updateWeight = async () => {
    if (!editItem.name) {
      alert('Item name cannot be empty');
      return;
    }

    const docRef = doc(collection(firestore, 'inventory'), editItem.name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, unit, expiry } = docSnap.data();
      const updatedData = { quantity, weight: editItem.weight, unit: editItem.unit };
      if (expiry) updatedData.expiry = expiry; // Only include expiry if it exists
      await setDoc(docRef, updatedData, { merge: true });
      await updateInventory();
      handleEditClose();
    }
  };

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weightUnits = ['kg', 'g', 'lb', 'oz', 'mg', 't', 'st'];
  const lengthUnits = ['m', 'cm', 'mm', 'km', 'in', 'ft', 'yd', 'mi'];

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={3}
      p={2}
      bgcolor="#f5f5f5"
    >
      <Box
        display="flex"
        justifyContent="center"
        width="100%"
        mb={2}
      >
        <InputBase
          placeholder="Search for items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startAdornment={<SearchIcon />}
          sx={{ bgcolor: 'white', borderRadius: 1, p: 1, width: 400, boxShadow: 2 }}
        />
      </Box>
      
      <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<AddIcon />}>
        Add New Item
      </Button>

      <Stack direction="row" flexWrap="wrap" justifyContent="center" alignItems="center" spacing={2} mt={2}>
        {filteredInventory.map(({ name, quantity, weight, unit, expiry }) => (
          <Card key={name} sx={cardStyle}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Quantity: {quantity}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Weight: {weight} {unit}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Expiry: {expiry ? expiry.toDate().toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" onClick={() => addItemByName(name)} startIcon={<AddIcon />}>
                Add
              </Button>
              <Button size="small" color="secondary" onClick={() => removeItem(name)} startIcon={<RemoveIcon />}>
                Remove
              </Button>
              <IconButton color="primary" onClick={() => handleEditOpen({ name, weight, unit })}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => handleDelete(name)}>
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Stack>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add New Item
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              label="Weight"
              variant="outlined"
              type="number"
              value={itemWeight}
              onChange={(e) => setItemWeight(e.target.value)}
            />
            <Select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              variant="outlined"
              label="Unit"
              fullWidth
            >
              {weightUnits.concat(lengthUnits).map((unit) => (
                <MenuItem key={unit} value={unit}>{unit}</MenuItem>
              ))}
            </Select>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={addItem}
          >
            Add Item
          </Button>
        </Box>
      </Modal>

      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Item
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={editItem.name}
              disabled
            />
            <TextField
              label="Weight"
              variant="outlined"
              type="number"
              value={editItem.weight}
              onChange={(e) => setEditItem({ ...editItem, weight: e.target.value })}
            />
            <Select
              value={editItem.unit}
              onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
              variant="outlined"
              label="Unit"
              fullWidth
            >
              {weightUnits.concat(lengthUnits).map((unit) => (
                <MenuItem key={unit} value={unit}>{unit}</MenuItem>
              ))}
            </Select>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={updateWeight}
          >
            Update Weight
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
