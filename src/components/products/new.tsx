import React, { useState, useEffect } from 'react'
import ImageUploader from 'react-images-upload'
import {
  Button,
  createStyles,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  makeStyles,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Theme,
} from '@material-ui/core'
import { Category } from '../../models/Category'
import { UF } from '../../models/UF'
import { Product } from '../../models/Product'
import * as FileManager from '../../utils/FileManager'
import { useHistory } from 'react-router'
import { User } from '@vital-edu/radiks'
import LoadingDialog from '../LoadingDialog'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

export default function CreateProduct() {
  const classes = useStyles()
  const history = useHistory()

  const [name, setName] = useState('')
  const [photos, setPhotos] = useState<Array<string>>([])
  const [price, setPrice] = useState("0")
  const [category, setCategory] = useState<Category>(Category.servicos)
  const [description, setDescription] = useState('')
  const [uf, setUF] = useState(UF.digital)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingTitle, setLoadingTitle] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingProgressShouldBe, setLoadingProgressShouldBe] = useState(0)

  const onDrop = async (files: Array<File>) => {
    const newPhotos = await FileManager.convertFiles(files)
    setPhotos([...photos, ...newPhotos]);
  }

  const onNameChange = (e: React.ChangeEvent<{ value: string }>) => {
    setName(e.target.value)
  }

  const onPriceChange = (e: React.ChangeEvent<{ value: string }>) => {
    setPrice(e.target.value)
  }

  const onDescriptionChange = (e: React.ChangeEvent<{ value: string }>) => {
    setDescription(e.target.value)
  }

  const onCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setCategory(e.target.value as Category)
  }

  const onUFChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setUF(e.target.value as UF)
  }

  useEffect(() => {
    if (!isLoading) return
    let loadingTimer

    if (loadingProgress >= 100) {
      setIsLoading(false)
      setLoadingProgress(0)
    } else if (loadingProgress < loadingProgressShouldBe) {
      loadingTimer = setTimeout(() => {
        setLoadingProgress(loadingProgress + 1)
      }, 1)
    } else {
      loadingTimer = setTimeout(() => {
        setLoadingProgress(loadingProgress + 1)
      }, 50)
    }

    return () => clearInterval(loadingTimer)
  }, [isLoading, loadingProgress, loadingProgressShouldBe])

  const onSubmitProduct = async () => {
    setIsLoading(true)
    setLoadingTitle('Registrando produto')
    const newProduct = new Product({
      name,
      photos,
      price: parseFloat(price),
      category,
      description,
      uf,
      user_id: User.currentUser()._id,
    })
    try {
      await newProduct.save()
      setLoadingProgressShouldBe(100)
      history.push('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      {isLoading && <LoadingDialog
        title={loadingTitle}
        loadingProgress={loadingProgress}
      />}
      <form noValidate autoComplete="off" className={classes.root}>
        <legend>Cadastrar Produto/Serviço</legend>
        <TextField
          required
          label="Nome do produto/serviço"
          value={name}
          onChange={onNameChange}
          fullWidth={true}
          variant="outlined"
        />
        <TextField
          label="Descrição"
          multiline
          rowsMax="15"
          value={description}
          onChange={onDescriptionChange}
          variant="outlined"
          fullWidth={true}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel>Preço</InputLabel>
          <OutlinedInput
            required
            value={price}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            labelWidth={60}
            onChange={onPriceChange}
          />
        </FormControl>
        <ImageUploader
          withIcon={true}
          buttonText='Envie fotos do produto/serviço'
          onChange={onDrop}
          imgExtension={['.jpg', '.gif', '.png', '.gif']}
          maxFileSize={5242880}
          withPreview={true}
          label={'Tamanho máximo dos arquivos: 5mb. Imagens permitidas: .jpg, .gif, .png'}
        />
        <FormControl required
          fullWidth={true}>
          <InputLabel>Categoria</InputLabel>
          <Select value={category} onChange={onCategoryChange}>
            {Object.entries(Category).map(([key, value]) => (
              <MenuItem key={key} value={value}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl required
          fullWidth={true}>
          <InputLabel>Localidade do produto/serviço</InputLabel>
          <Select value={uf} onChange={onUFChange}>
            {Object.entries(UF).map(([key, value]) => (
              <MenuItem key={key} value={value}>{value}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          fullWidth={true}
          variant="contained"
          color="primary"
          onClick={onSubmitProduct}>
          Publicar
        </Button>
      </form>
    </Grid>
  )
}
