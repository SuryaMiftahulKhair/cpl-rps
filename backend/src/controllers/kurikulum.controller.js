import * as kurikulumService from '../services/kurikulum.service.js';



// Handler untuk fungsi POST
export const createKurikulum = async (req, res) => {
  try {
    const { nama, tahun, program_studi_id } = req.body;
    if (!nama || !tahun || !program_studi_id) {
      return res.status(400).json({ message: 'Nama, tahun, and program_studi_id are required' });
    }
    if (typeof tahun !== 'number' || typeof program_studi_id !== 'number') {
        return res.status(400).json({ message: 'Tahun and program_studi_id must be numbers' });
    }

    const newKurikulum = await kurikulumService.createNewKurikulum({
      nama,
      tahun,
      program_studi_id,
    });

    res.status(201).json(newKurikulum);

  } catch (error) {
    console.error('Error creating kurikulum:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('nama')) {
        return res.status(409).json({ message: 'Nama kurikulum sudah ada' }); 
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Handler untuk fungsi GET
export const getAllKurikulum = async (req, res) => {
  try {
    const allKurikulum = await kurikulumService.fetchAllKurikulum();
    res.status(200).json(allKurikulum);
  } catch (error) {
    console.error('Error fetching kurikulum:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Handler untuk fungsi GET by ID
export const getKurikulumById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    const kurikulum = await kurikulumService.fetchKurikulumById(id);
    if (!kurikulum) {
      return res.status(404).json({ message: 'Kurikulum not found' });
    }

    res.status(200).json(kurikulum);
  } catch (error) {
    console.error('Error fetching kurikulum by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Handler untuk fungsi UPDATE
export const updateKurikulum = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    const { nama, tahun } = req.body;
 
    if (!nama && !tahun) {
        return res.status(400).json({ message: 'Nama atau tahun harus diisi untuk update' });
    }
    const updatedData = {};
    if (nama) updatedData.nama = nama;
    if (tahun) updatedData.tahun = parseInt(tahun); 

    const updatedKurikulum = await kurikulumService.updateExistingKurikulum(id, updatedData);

    res.status(200).json(updatedKurikulum);
  } catch (error) {
    console.error('Error updating kurikulum:', error);
   
     if (error.code === 'P2002' && error.meta?.target?.includes('nama')) {
        return res.status(409).json({ message: 'Nama kurikulum sudah ada' });
    }
     if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Kurikulum not found for update' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Handler untuk fungsi DELETE 
export const deleteKurikulum = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
     if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    await kurikulumService.deleteExistingKurikulum(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting kurikulum:', error);
     if (error.code === 'P2025') { 
        return res.status(404).json({ message: 'Kurikulum not found for deletion' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};