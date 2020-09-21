module.exports = [
  {
    band : 1,
    wavelength : 0.47,
    label : 'Blue',
    type : 'Visible',
    description : `The 0.47 µm, or "Blue" visible band, is one of
      two visible bands on the ABI, and provides data
      for monitoring aerosols. Included on NASA’s
      MODIS and Suomi NPP VIIRS instruments, this
      band provides well-established benefits. The
      geostationary ABI 0.47 µm band will provide
      nearly continuous daytime observations of
      dust, haze, smoke and clouds. The 0.47 µm
      band is more sensitive to aerosols / dust /
      smoke because it samples a part of the
      electromagnetic spectrum where clear-sky
      atmospheric scattering is important.`,
    apids : ['b0', 'c0', 'd0', 'e0']
  },
  {
    band : 2,
    wavelength : 0.64,
    label : 'Red',
    type : 'Visible',
    description : `The ‘Red’ Visible band – 0.64 µm – has the
      finest spatial resolution (0.5 km at the subsatellite point) of all ABI bands. Thus it is ideal
      to identify small-scale features such as river
      fogs and fog/clear air boundaries, or
      overshooting tops or cumulus clouds. It has
      also been used to document daytime snow
      and ice cover, diagnose low-level cloud-drift
      winds, assist with detection of volcanic ash
      and analysis of hurricanes and winter storms.
      The ‘Red’ Visible band is also essential for
      creation of "true color" imagery.`,
    apids : ['b1', 'c1', 'd1', 'e1']
  },
  {
    band : 3,
    wavelength : 0.86,
    label : 'Veggie',
    type : 'Near-IR',
    description : `The 0.86 μm band (a reflective band) detects
      daytime clouds, fog, and aerosols and is used to
      compute the normalized difference vegetation
      index (NDVI). Its nickname is the "veggie" or
      "vegetation" band. The 0.86 μm band can
      detect burn scars and thereby show land
      characteristics to determine fire and run-off
      potential. Vegetated land, in general, shows up
      brighter in this band than in visible bands. Landwater contrast is also large in this band. This
      band is essential to simulate a "green" band
      needed for a true color image from the ABI.`,
    apids : ['b2', 'c2', 'd2', 'e2']
  },
  {
    band : 4,
    wavelength : 1.37,
    label : 'Cirrus',
    type : 'Near-IR',
    description : `The Cirrus Band (1.37 µm) is unique among
      the reflective bands on the ABI in that it
      occupies a region of very strong absorption by
      water vapor in the electromagnetic spectrum.
      It will detect very thin cirrus clouds during the
      day. In the image at right of a Supercell
      thunderstorm over Oklahoma, low-level
      cumulus clouds east of the system are only
      faintly visible because energy at 1.37 µm has
      been absorbed as it moves through the moist
      atmosphere.`,
    apids : ['b3', 'c3', 'd3', 'e3']
  },
  {
    band : 5,
    wavelength : 1.6,
    label : 'Snow/Ice',
    type : 'Near-IR',
    description : `The Snow/Ice band takes advantage of the
      difference between the refraction components
      of water and ice at 1.61 µm. Liquid water
      clouds are bright in this channel; ice clouds are
      darker because ice absorbs (rather than
      reflects) radiation at 1.61 µm. Thus you can
      infer cloud phase: compare at right the darker
      region of the cirrus anvil to the more reflective
      water-based cumulus clouds to the right of the
      storm. Land/water contrast is great at 1.61
      µm (lakes are readily apparent in the image)
      and shadows can be particularly striking. Fires
      can also be detected at night using this band`,
    apids : ['b4', 'c4', 'd4', 'e4']
  },
  {
    band : 6,
    wavelength : 2.2,
    label : 'Cloud Particle Size',
    type : 'Near-IR',
    description : `The 2.24 μm band, in conjunction with other
      bands, enables cloud particle size estimation.
      Cloud particle size changes can indicate cloud
      development. The 2.24 μm band is also used
      with other bands to estimate aerosol particle
      size (by characterizing the aerosol-free
      background over land), to create cloud
      masking and to detect hot spots.`,
    apids : ['b5', 'c5', 'd5', 'e5']
  },
  {
    band : 7,
    wavelength : 3.9,
    label : 'Shortwave Window',
    type : 'IR',
    description : `The 3.9 μm band can be used to identify fog
      and low clouds at night, identify fire hot spots,
      detect volcanic ash, estimate sea-surface
      temperatures, and discriminate between ice
      crystal sizes during the day. Low-level
      atmospheric vector winds can be estimated
      with this band, and the band can be used to
      study urban heat islands. The 3.9 μm is unique
      among ABI bands because it senses both
      emitted terrestrial radiation as well as
      significant reflected solar radiation during the
      day.`,
    apids : ['b6', 'c6', 'd6', 'e6']
  },
  {
    band : 8,
    wavelength : 6.2,
    label : 'Upper-Level Tropospheric Water Vapor',
    type : 'IR',
    description : `The 6.2 µm "Upper-level water vapor" band is
      one of three water vapor bands on the ABI, and
      is used for tracking upper-tropospheric winds,
      identifying jet streams, forecasting hurricane
      track and mid-latitude storm motion, monitoring
      severe weather potential, estimating upper/
      mid-level moisture (for legacy vertical moisture
      profiles) and identifying regions where the
      potential for turbulence exists. Further, it can be
      used to validate numerical model initialization
      and warming/cooling with time can reveal
      vertical motions at mid- and upper levels.`,
    apids : ['b7', 'c7', 'd7', 'e7']
  },
  {
    band : 9,
    wavelength : 6.9,
    label : 'Mid-Level Tropospheric Water Vapor',
    type : 'IR',
    description : `The 6.9 µm "Mid-level water vapor" band is one
      of three water vapor bands on the ABI, and is
      used for tracking middle-tropospheric winds,
      identifying jet streams, forecasting hurricane
      track and mid-latitude storm motion, monitoring
      severe weather potential, estimating mid-level
      moisture (for legacy vertical moisture profiles)
      and identifying regions where turbulence might
      exist. Surface features are usually not apparent
      in this band. Brightness Temperatures show
      cooling because of absorption of energy at 6.9
      µm by water vapor.`,
    apids : ['b8', 'c8', 'd8', 'e8']
  },
  {
    band : 10,
    waevlength : 7.3,
    label : 'Lower-level Water Vapor',
    type : 'IR',
    description : `The 7.3 µm "Lower-level water vapor" band is
      one of three water vapor bands on the ABI. It
      typically senses farthest down into the midtroposphere in cloud-free regions, to around
      500-750 hPa. It is used to track lowertropospheric winds, identify jet streaks, monitor
      severe weather potential, estimate lower-level
      moisture (for legacy vertical moisture profiles),
      identify regions where the potential for
      turbulence exists, highlight volcanic plumes that
      are rich in sulphur dioxide (SO2) and track LakeEffect snow bands.`,
    apids : ['b9', 'c9', 'd9', 'e9']
  },
  {
    band : 11,
    wavelength : 8.4,
    label : 'Cloud-Top Phase',
    type : 'IR',
    description : `The infrared 8.5 μm band is a window channel;
      there is little atmospheric absorption of
      energy in clear skies at this wavelength (unless
      SO2 from a volcanic eruption is present).
      However, knowledge of emissivity is important
      in the interpretation of this Band: Differences
      in surface emissivity at 8.5 μm occur over
      different soil types, affecting the perceived
      brightness temperature. Water droplets also
      have different emissivity properties for 8.5 μm
      radiation compared to other wavelengths. The
      8.5 μm band was not available on either the
      Legacy GOES Imager or GOES Sounder.`,
    apids : ['ba', 'ca', 'da', 'ea']
  },
  {
    band : 12,
    wavelength : 9.6,
    label : 'Ozone',
    type : 'IR',
    description : `The 9.6 μm band gives information both
      day and night about the dynamics of
      the atmosphere near the tropopause.
      This band shows cooler temperatures
      than the clean window band because
      both ozone and water vapor absorb 9.6
      μm atmospheric energy. The cooling
      effect is especially apparent at large
      zenith angles. This band alone cannot
      diagnose total column ozone: product
      generation using other bands will be
      necessary for that.`,
    apids : ['bb', 'cb', 'db', 'eb']
  },
  {
    band : 13,
    wavelength : 10.3,
    label : 'Clean IR Longwave Window',
    type : 'IR',
    description : `The 10.3 μm "clean" infrared window band is
      less sensitive than other infrared window bands
      to water vapor absorption, and therefore
      improves atmospheric moisture corrections, aids
      in cloud and other atmospheric feature
      identification/classification, estimation of cloudtop brightness temperature and cloud particle
      size, and surface property characterization in
      derived products.`,
    apids : ['bc', 'cc', 'dc', 'ec']
  },
  {
    band : 14,
    wavelength : 11.2,
    label : 'IR Longwave Window',
    type : 'IR',
    description : `The infrared 11.2 μm band is a window
      channel; however, there is absorption of
      energy by water vapor at this wavelength.
      Brightness Temperatures (BTs) are affected by
      this absorption, and 11.2 μm BTs will be cooler
      than clean window (10.3 μm) BTs – by an
      amount that is a function of the amount of
      moisture in the atmosphere. This band has
      similarities to the legacy infrared channel at
      10.7 μm.`,
    apids : ['bd', 'cd', 'dd', 'ed']
  },
  {
    band : 15,
    wavelength : 12.3,
    label : 'Dirty Longwave Window Band',
    type : 'IR',
    description : `Absorption and re-emission of water vapor,
      particularly in the lower troposphere, slightly
      cools most non-cloud brightness temperatures
      (BTs) in the 12.3 μm band compared to the
      other infrared window channels: the more
      water vapor, the greater the BT difference.
      The 12.3 μm band and the 10.3 μm are used
      to compute the ‘split window difference’.
      The 10.3 μm "Clean Window" channel is a
      better choice than the "Dirty Window" (12.3
      μm) for the monitoring of simple atmospheric
      phenomena.`,
    apids : ['be', 'ce', 'de', 'ee']
  },
  {
    band : 16,
    wavelength : 13.3,
    label : 'CO2 longwave infrared',
    type : 'IR',
    description : `Products derived using the infrared 13.3 μm
      "Carbon Dioxide" band can be used to
      delineate the tropopause, to estimate cloudtop heights, to discern the level of Derived
      Motion Winds, to supplement Automated
      Surface Observing System (ASOS) sky
      observations and to identify Volcanic Ash. The
      13.3 μm band is vital for Baseline Products;
      that is demonstrated by its presence on
      heritage GOES Imagers and Sounders. Despite
      its importance in products, the CO2 channel is
      typically not used for visual interpretation of
      weather events.`,
    apids : ['bd', 'cd', 'dd', 'ed']
  }
]