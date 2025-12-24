// src/pages/RegisterCompany.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";
import axios from "axios";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import {
  FaBuilding,
  FaMoneyBillWave,
  FaClipboardList,
  FaBoxes,
  FaCouch,
  FaTv,
  FaStar,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaRupeeSign,
  FaListUl,
  FaEnvelope,
  FaUser,
  FaImages,
  FaTruck,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaLock,
  FaUserShield,
} from "react-icons/fa";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { useAuthStore } from "../stores/useAuthStore";

/* --------------------------------------------------------------------
   Custom select option hover styles (kept as-is)
-------------------------------------------------------------------- */
const selectOptionsStyle = `
  select {
    accent-color: #ec4899;
  }
  select option {
    padding: 10px 8px;
    background-color: white;
    color: #1f2937;
    background-image: none;
  }
  select option:hover {
    background-color: #fce7f3 !important;
    background-image: linear-gradient(#fce7f3, #fce7f3) !important;
    color: #be185d !important;
  }
  select option:focus {
    background-color: #fce7f3 !important;
    background-image: linear-gradient(#fce7f3, #fce7f3) !important;
    color: #be185d !important;
  }
  select option:checked {
    background: linear-gradient(#fce7f3, #fce7f3) !important;
    background-color: #fce7f3 !important;
    color: #be185d !important;
  }
  select option:checked:hover {
    background: linear-gradient(#fbcfe8, #fbcfe8) !important;
    background-color: #fbcfe8 !important;
    color: #be185d !important;
  }
  select option:checked:focus {
    background: linear-gradient(#fbcfe8, #fbcfe8) !important;
    background-color: #fbcfe8 !important;
    color: #be185d !important;
  }
`;

/* --------------------------------------------------------------------
   CustomSelect (keeps behaviour; will show vehicle emoji icon if provided)
-------------------------------------------------------------------- */
const CustomSelect = ({ value, onChange, options, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-lg px-3 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500 focus:ring-1 focus:ring-pink-200 text-left flex justify-between items-center ${required && !value ? "border-red-500" : ""
          }`}
      >
        <span className="truncate">
          {value ? (
            <>
              {options.find((o) => o.label === value)?.icon || ""} {value}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 bg-white rounded-lg shadow-lg z-50">
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                onChange(opt.label);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-left transition-colors ${value === opt.label
                ? "bg-pink-100 text-pink-800 font-semibold"
                : "hover:bg-pink-50 text-gray-900"
                }`}
            >
              <span className="truncate">
                {opt.icon ? `${opt.icon} ` : ""} {opt.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------
   CheckboxGroup: small helper UI used later
-------------------------------------------------------------------- */
const CheckboxGroup = ({
  title,
  icon,
  name,
  options,
  formData,
  handleChange,
  isOpen,
  toggleOpen,
  noBorder,
}) => (
  <div className={`${noBorder ? "" : "border-t"} p-0`}>
    <button
      type="button"
      onClick={toggleOpen}
      className="w-full flex justify-between items-center p-4 font-semibold text-pink-600 hover:bg-pink-50 transition-all"
    >
      <span className="flex items-center gap-2">
        {icon} {title}
      </span>
      {isOpen ? (
        <ChevronUpIcon className="w-5 h-5" />
      ) : (
        <ChevronDownIcon className="w-5 h-5" />
      )}
    </button>

    {isOpen && (
      <div className="p-4 pt-0 space-y-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center cursor-pointer px-3 py-2 rounded-md hover:bg-pink-50 transition-all"
          >
            <input
              type="checkbox"
              name={name}
              value={opt}
              checked={formData[name]?.includes(opt)}
              onChange={handleChange}
              className="mr-2 accent-pink-600 w-4 h-4"
            />
            {opt}
          </label>
        ))}
      </div>
    )}
  </div>
);

/* --------------------------------------------------------------------
   Vehicles: emoji icons added for each vehicle type for UI
-------------------------------------------------------------------- */
const VEHICLE_OPTIONS = [
  { label: "SWB Van", capacity: 5, icon: "🚐" },
  { label: "MWB Van", capacity: 8, icon: "🚐" },
  { label: "LWB Van", capacity: 11, icon: "🚐" },
  { label: "XLWB Van", capacity: 13, icon: "🚐" },
  { label: "MWB Luton Van", capacity: 17, icon: "🚚" },
  { label: "LWB Luton Van", capacity: 19, icon: "🚚" },
  { label: "7.5 Tonne Lorry", capacity: 30, icon: "🚛" },
  { label: "12 Tonne Lorry", capacity: 45, icon: "🚛" },
  { label: "18 Tonne Lorry", capacity: 55, icon: "🚛" },
];

const POSTCODE_DISTRICTS = {
  "AB": ["AB10", "AB11", "AB12", "AB13", "AB14", "AB15", "AB16", "AB21", "AB22", "AB23", "AB24", "AB25", "AB30", "AB31", "AB32", "AB33", "AB34", "AB35", "AB36", "AB37", "AB38", "AB39", "AB41", "AB42", "AB43", "AB44", "AB45", "AB51", "AB52", "AB53", "AB54", "AB55", "AB56"],
  "AL": ["AL1", "AL2", "AL3", "AL4", "AL5", "AL6", "AL7", "AL8", "AL9", "AL10"],
  "B": ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B23", "B24", "B25", "B26", "B27", "B28", "B29", "B30", "B31", "B32", "B33", "B34", "B35", "B36", "B37", "B38", "B40", "B42", "B43", "B44", "B45", "B46", "B47", "B48", "B49", "B50"],
  "BA": ["BA1", "BA2", "BA3", "BA4", "BA5", "BA6", "BA7", "BA8", "BA9", "BA10", "BA11", "BA12", "BA13", "BA14", "BA15", "BA16", "BA20", "BA21", "BA22"],
  "BB": ["BB1", "BB2", "BB3", "BB4", "BB5", "BB6", "BB7", "BB8", "BB9", "BB10", "BB11", "BB12", "BB18"],
  "BD": ["BD1", "BD2", "BD3", "BD4", "BD5", "BD6", "BD7", "BD8", "BD9", "BD10", "BD11", "BD12", "BD13", "BD14", "BD15", "BD16", "BD17", "BD18", "BD19"],
  "BH": ["BH1", "BH2", "BH3", "BH4", "BH5", "BH6", "BH7", "BH8", "BH9", "BH10", "BH11", "BH12", "BH13", "BH14", "BH15", "BH16", "BH17", "BH18", "BH19", "BH20", "BH21", "BH22", "BH23", "BH24", "BH25", "BH31"],
  "BL": ["BL0", "BL1", "BL2", "BL3", "BL4", "BL5", "BL6", "BL7", "BL8", "BL9"],
  "BN": ["BN1", "BN2", "BN3", "BN7", "BN8", "BN9", "BN10", "BN11", "BN12", "BN13", "BN14", "BN15", "BN16", "BN17", "BN18", "BN20", "BN21", "BN22", "BN23", "BN24", "BN25", "BN26", "BN27", "BN41", "BN42", "BN43", "BN44", "BN45", "BN50", "BN51", "BN52", "BN88"],
  "BR": ["BR1", "BR2", "BR3", "BR4", "BR5", "BR6", "BR7", "BR8"],
  "BS": ["BS1", "BS2", "BS3", "BS4", "BS5", "BS6", "BS7", "BS8", "BS9", "BS10", "BS11", "BS13", "BS14", "BS15", "BS16", "BS20", "BS21", "BS22", "BS23", "BS24", "BS25", "BS26", "BS27", "BS28", "BS29", "BS30", "BS31", "BS32", "BS33", "BS34", "BS35", "BS36", "BS37", "BS39", "BS40", "BS41", "BS48", "BS49"],
  "BT": ["BT1", "BT2", "BT3", "BT4", "BT5", "BT6", "BT7", "BT8", "BT9", "BT10", "BT11", "BT12", "BT13", "BT14", "BT15", "BT16", "BT17", "BT18", "BT19", "BT20", "BT21", "BT22", "BT23", "BT24", "BT25", "BT26", "BT27", "BT28", "BT29", "BT30", "BT31", "BT32", "BT33", "BT34", "BT35", "BT36", "BT37", "BT38", "BT39", "BT40", "BT41", "BT42", "BT43", "BT44", "BT45", "BT46", "BT47", "BT48", "BT49", "BT51", "BT52", "BT53", "BT54", "BT55", "BT56", "BT57", "BT60", "BT61", "BT62", "BT63", "BT64", "BT65", "BT66", "BT67", "BT68", "BT69", "BT70", "BT71", "BT72", "BT74", "BT75", "BT76", "BT77", "BT78", "BT79", "BT80", "BT81", "BT82", "BT92", "BT93", "BT94"],
  "CA": ["CA1", "CA2", "CA3", "CA4", "CA5", "CA6", "CA7", "CA8", "CA9", "CA10", "CA11", "CA12", "CA13", "CA14", "CA15", "CA16", "CA17", "CA18", "CA19", "CA20", "CA21", "CA22", "CA23", "CA24", "CA25", "CA26", "CA27", "CA28"],
  "CB": ["CB1", "CB2", "CB3", "CB4", "CB5", "CB6", "CB7", "CB8", "CB9", "CB10", "CB11", "CB21", "CB22", "CB23", "CB24", "CB25"],
  "CF": ["CF3", "CF5", "CF10", "CF11", "CF14", "CF15", "CF23", "CF24", "CF31", "CF32", "CF33", "CF34", "CF35", "CF36", "CF37", "CF38", "CF39", "CF40", "CF41", "CF42", "CF43", "CF44", "CF45", "CF46", "CF47", "CF48", "CF61", "CF62", "CF63", "CF64", "CF71", "CF72", "CF81", "CF82", "CF83"],
  "CH": ["CH1", "CH2", "CH3", "CH4", "CH5", "CH6", "CH7", "CH8", "CH25", "CH26", "CH27", "CH30", "CH32", "CH33", "CH34", "CH41", "CH42", "CH43", "CH44", "CH45", "CH46", "CH47", "CH48", "CH49", "CH60", "CH61", "CH62", "CH63", "CH64", "CH65", "CH66"],
  "CM": ["CM0", "CM1", "CM2", "CM3", "CM4", "CM5", "CM6", "CM7", "CM8", "CM9", "CM11", "CM12", "CM13", "CM14", "CM15", "CM16", "CM17", "CM18", "CM19", "CM20", "CM21", "CM22", "CM23", "CM24", "CM77"],
  "CO": ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6", "CO7", "CO8", "CO9", "CO10", "CO11", "CO12", "CO13", "CO14", "CO15", "CO16"],
  "CR": ["CR0", "CR2", "CR3", "CR4", "CR5", "CR6", "CR7", "CR8", "CR9"],
  "CT": ["CT1", "CT2", "CT3", "CT4", "CT5", "CT6", "CT7", "CT8", "CT9", "CT10", "CT11", "CT12", "CT13", "CT14", "CT15", "CT16", "CT17", "CT18", "CT19", "CT20"],
  "CV": ["CV1", "CV2", "CV3", "CV4", "CV5", "CV6", "CV7", "CV8", "CV9", "CV10", "CV11", "CV12", "CV13", "CV21", "CV22", "CV23", "CV31", "CV32", "CV33", "CV34", "CV35", "CV36", "CV37", "CV47"],
  "CW": ["CW1", "CW2", "CW3", "CW4", "CW5", "CW6", "CW7", "CW8", "CW9", "CW10", "CW11", "CW12"],
  "DA": ["DA1", "DA2", "DA3", "DA4", "DA5", "DA6", "DA7", "DA8", "DA9", "DA10", "DA11", "DA12", "DA13", "DA14", "DA15", "DA16", "DA17", "DA18"],
  "DD": ["DD1", "DD2", "DD3", "DD4", "DD5", "DD6", "DD7", "DD8", "DD9", "DD10", "DD11"],

  /* --- CONTINUED (rest of the postcode areas) --- */

  "DE": ["DE1", "DE3", "DE4", "DE5", "DE6", "DE7", "DE11", "DE12", "DE13", "DE14", "DE15", "DE21", "DE22", "DE23", "DE24", "DE45", "DE55", "DE56"],
  "DG": ["DG1", "DG2", "DG3", "DG4", "DG5", "DG6", "DG7", "DG8", "DG9", "DG10", "DG11"],
  "DH": ["DH1", "DH2", "DH3", "DH4", "DH5", "DH6", "DH7", "DH8", "DH9"],
  "DL": ["DL1", "DL2", "DL3", "DL4", "DL5", "DL6", "DL7", "DL8", "DL9", "DL10"],
  "DN": ["DN1", "DN2", "DN3", "DN4", "DN5", "DN6", "DN7", "DN8", "DN9", "DN10", "DN11", "DN12", "DN13", "DN14", "DN15", "DN16", "DN17", "DN18", "DN19", "DN20", "DN21"],
  "DT": ["DT1", "DT2", "DT3", "DT4", "DT5", "DT6", "DT7", "DT8", "DT9"],
  "DY": ["DY1", "DY2", "DY3", "DY4", "DY5", "DY6", "DY7", "DY8", "DY9", "DY10", "DY11"],
  "E": ["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E20", "E98"],
  "EC": ["EC1A", "EC1M", "EC1N", "EC1R", "EC1V", "EC1Y", "EC2A", "EC2M", "EC2N", "EC2P", "EC2R", "EC2V", "EC2Y", "EC3A", "EC3M", "EC3N", "EC3P", "EC3R", "EC3V", "EC4A", "EC4M", "EC4N", "EC4P", "EC4R", "EC4V"],
  "EH": ["EH1", "EH2", "EH3", "EH4", "EH5", "EH6", "EH7", "EH8", "EH9", "EH10", "EH11", "EH12", "EH13", "EH14", "EH15", "EH16", "EH17", "EH18", "EH19", "EH20", "EH21", "EH22", "EH23", "EH24", "EH25", "EH26", "EH27", "EH28", "EH29", "EH30", "EH31", "EH32", "EH33", "EH34", "EH35", "EH36", "EH37", "EH38", "EH39"],
  "EX": ["EX1", "EX2", "EX3", "EX4", "EX5", "EX6", "EX7", "EX8", "EX9", "EX10", "EX11", "EX12", "EX13", "EX14", "EX15", "EX16", "EX17", "EX18"],
  "FK": ["FK1", "FK2", "FK3", "FK4", "FK5", "FK6", "FK7", "FK8", "FK9", "FK10", "FK11", "FK12", "FK13", "FK14", "FK15", "FK16", "FK17"],
  "FY": ["FY1", "FY2", "FY3", "FY4", "FY5", "FY6", "FY7", "FY8", "FY9"],
  "G": ["G1", "G2", "G3", "G4", "G5", "G11", "G12", "G13", "G14", "G15", "G20", "G21", "G22", "G23", "G31", "G32", "G33", "G34", "G35", "G40", "G41", "G42", "G43", "G44", "G45", "G46", "G51", "G52", "G53", "G60", "G61", "G62", "G63", "G64", "G65", "G66", "G67"],
  "GL": ["GL1", "GL2", "GL3", "GL4", "GL5", "GL6", "GL7", "GL8", "GL9", "GL10", "GL11", "GL12", "GL13", "GL14", "GL15", "GL16", "GL17", "GL18", "GL19", "GL20", "GL50", "GL51", "GL52", "GL53", "GL54", "GL55"],
  "GU": ["GU1", "GU2", "GU3", "GU4", "GU5", "GU6", "GU7", "GU8", "GU9", "GU10", "GU11", "GU12", "GU13", "GU14", "GU15", "GU16", "GU17", "GU18", "GU19", "GU20", "GU21", "GU22", "GU23", "GU24", "GU25", "GU26", "GU27", "GU28", "GU29", "GU30"],
  "GY": ["GY1", "GY2", "GY3", "GY4"],
  "HA": ["HA0", "HA1", "HA2", "HA3", "HA4", "HA5", "HA6", "HA7", "HA8", "HA9"],
  "HD": ["HD1", "HD2", "HD3", "HD4", "HD5", "HD6", "HD7", "HD8", "HD9"],
  "HG": ["HG1", "HG2", "HG3", "HG4", "HG5"],
  "HP": ["HP1", "HP2", "HP3", "HP4", "HP5", "HP6", "HP7", "HP8", "HP9", "HP10", "HP11", "HP12", "HP13"],
  "HR": ["HR1", "HR2", "HR3", "HR4", "HR5", "HR6", "HR7", "HR8", "HR9"],
  "HS": ["HS1", "HS2", "HS3", "HS4", "HS5", "HS6", "HS7", "HS8"],
  "HU": ["HU1", "HU2", "HU3", "HU4", "HU5", "HU6", "HU7", "HU8", "HU9", "HU10", "HU11", "HU12", "HU13", "HU14"],
  "HX": ["HX1", "HX2", "HX3", "HX4", "HX5", "HX6", "HX7"],
  "IG": ["IG1", "IG2", "IG3", "IG4", "IG5", "IG6", "IG7", "IG8", "IG9", "IG10"],
  "IM": ["IM1", "IM2", "IM3", "IM4", "IM5", "IM6"],
  "IP": ["IP1", "IP2", "IP3", "IP4", "IP5", "IP6", "IP7", "IP8", "IP9", "IP10", "IP11", "IP12", "IP13"],
  "IV": ["IV1", "IV2", "IV3", "IV4", "IV5", "IV6", "IV7", "IV8", "IV9", "IV10", "IV11", "IV12", "IV13", "IV14", "IV15", "IV16", "IV17", "IV18", "IV19", "IV20", "IV21", "IV22", "IV23", "IV24", "IV25", "IV26", "IV27", "IV28", "IV30", "IV31", "IV32", "IV36"],
  "JE": ["JE1", "JE2", "JE3"],
  "KA": ["KA1", "KA2", "KA3", "KA4", "KA5", "KA6", "KA7", "KA8", "KA9", "KA10", "KA11", "KA12", "KA13", "KA14", "KA15"],
  "KT": ["KT1", "KT2", "KT3", "KT4", "KT5", "KT6", "KT7", "KT8", "KT9", "KT10", "KT11", "KT12", "KT13", "KT14", "KT15", "KT16", "KT17"],
  "KW": ["KW1", "KW2", "KW3", "KW5", "KW6", "KW7", "KW8", "KW9", "KW10", "KW11", "KW12", "KW13", "KW14", "KW15"],
  "KY": ["KY1", "KY2", "KY3", "KY4", "KY5", "KY6", "KY7", "KY8", "KY9", "KY10", "KY11", "KY12", "KY13", "KY14"],
  "L": ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17", "L18", "L19", "L20", "L21", "L22", "L23", "L24", "L25", "L26", "L27", "L28", "L29", "L30", "L31", "L32", "L33", "L34", "L35", "L36", "L37", "L38", "L39", "L40", "L41", "L42", "L44", "L45"],
  "LA": ["LA1", "LA2", "LA3", "LA4", "LA5", "LA6", "LA7", "LA8", "LA9", "LA10", "LA11", "LA12", "LA13", "LA14"],
  "LD": ["LD1", "LD2", "LD3", "LD4", "LD5", "LD6", "LD7", "LD8"],
  "LE": ["LE1", "LE2", "LE3", "LE4", "LE5", "LE6", "LE7", "LE8", "LE9", "LE10", "LE11", "LE12", "LE13", "LE14", "LE15", "LE16", "LE17", "LE18", "LE19", "LE20"],
  "LL": ["LL11", "LL12", "LL13", "LL14", "LL15", "LL16", "LL17", "LL18", "LL19", "LL20", "LL21", "LL22", "LL23", "LL24", "LL25", "LL26", "LL27", "LL28", "LL29", "LL30", "LL31", "LL32", "LL33", "LL34", "LL35", "LL36", "LL37", "LL38", "LL39", "LL40", "LL41"],
  "LN": ["LN1", "LN2", "LN3", "LN4", "LN5", "LN6", "LN7", "LN8", "LN9", "LN10", "LN11"],
  "LS": ["LS1", "LS2", "LS3", "LS4", "LS5", "LS6", "LS7", "LS8", "LS9", "LS10", "LS11", "LS12", "LS13", "LS14", "LS15", "LS16", "LS17", "LS18", "LS19", "LS20", "LS21", "LS22", "LS23", "LS24", "LS25", "LS26", "LS27", "LS28", "LS29", "LS30", "LS31", "LS32", "LS33", "LS34", "LS35", "LS36"],
  "M": ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M11", "M12", "M13", "M14", "M15", "M16", "M17", "M18", "M19", "M20", "M21", "M22", "M23", "M24", "M25", "M26", "M27", "M28", "M29", "M30", "M31", "M32", "M33", "M34", "M35", "M38", "M40", "M41"],
  "ME": ["ME1", "ME2", "ME3", "ME4", "ME5", "ME6", "ME7", "ME8", "ME9", "ME10", "ME11", "ME12", "ME13", "ME14"],
  "MK": ["MK1", "MK2", "MK3", "MK4", "MK5", "MK6", "MK7", "MK8", "MK9", "MK10", "MK11", "MK12", "MK13", "MK14", "MK15", "MK16", "MK17", "MK18", "MK19"],
  "ML": ["ML1", "ML2", "ML3", "ML4", "ML5", "ML6", "ML7", "ML8", "ML9", "ML10", "ML11", "ML12", "ML13", "ML14", "ML15", "ML16", "ML17", "ML18", "ML19", "ML20", "ML21", "ML22", "ML23", "ML24"],
  "N": ["N1", "N2", "N3", "N4", "N5", "N6", "N7", "N8", "N9", "N10", "N11", "N12", "N13", "N14", "N15", "N16", "N17", "N18", "N19", "N20", "N21", "N22", "N23", "N24", "N25", "N26", "N27", "N28", "N29", "N30"],
  "NE": ["NE1", "NE2", "NE3", "NE4", "NE5", "NE6", "NE7", "NE8", "NE9", "NE10", "NE11", "NE12", "NE13", "NE15", "NE16", "NE17", "NE18", "NE19", "NE20", "NE21", "NE22", "NE23", "NE24", "NE25", "NE26", "NE27", "NE28", "NE29", "NE30", "NE31", "NE32", "NE33", "NE34", "NE35", "NE36", "NE37", "NE38", "NE39", "NE40"],
  "NG": ["NG1", "NG2", "NG3", "NG4", "NG5", "NG6", "NG7", "NG8", "NG9", "NG10", "NG11", "NG12", "NG13", "NG14", "NG15", "NG16", "NG17", "NG18", "NG19", "NG20", "NG21", "NG22", "NG23", "NG24"],
  "NN": ["NN1", "NN2", "NN3", "NN4", "NN5", "NN6", "NN7", "NN8", "NN9", "NN10", "NN11", "NN12", "NN13", "NN14", "NN15", "NN16"],
  "NP": ["NP4", "NP7", "NP8", "NP9", "NP10", "NP11", "NP12", "NP13", "NP16", "NP18", "NP19", "NP20", "NP22", "NP23", "NP24", "NP25", "NP26", "NP27", "NP28", "NP29", "NP30"],
  "NR": ["NR1", "NR2", "NR3", "NR4", "NR5", "NR6", "NR7", "NR8", "NR9", "NR10", "NR11", "NR12", "NR13", "NR14", "NR15", "NR16", "NR17", "NR18", "NR19"],
  "NW": ["NW1", "NW2", "NW3", "NW4", "NW5", "NW6", "NW7", "NW8", "NW9", "NW10", "NW11", "NW12", "NW13", "NW14", "NW15", "NW16", "NW17", "NW18", "NW19", "NW20", "NW21", "NW22"],
  "OL": ["OL1", "OL2", "OL3", "OL4", "OL5", "OL6", "OL7", "OL8", "OL9", "OL10", "OL11"],
  "OX": ["OX1", "OX2", "OX3", "OX4", "OX5", "OX6", "OX7", "OX8", "OX9", "OX10", "OX11", "OX12", "OX13", "OX14", "OX15", "OX16", "OX17", "OX18", "OX19"],
  "PA": ["PA1", "PA2", "PA3", "PA4", "PA5", "PA6", "PA7", "PA8", "PA9", "PA10", "PA11", "PA12", "PA13", "PA14", "PA15", "PA16", "PA17", "PA18", "PA19", "PA20", "PA21", "PA22", "PA23", "PA24", "PA25", "PA26", "PA27", "PA28", "PA29", "PA30", "PA31"],
  "PE": ["PE1", "PE2", "PE3", "PE4", "PE5", "PE6", "PE7", "PE8", "PE9", "PE10", "PE11", "PE12", "PE13", "PE14", "PE15", "PE16", "PE17"],
  "PH": ["PH1", "PH2", "PH3", "PH4", "PH5", "PH6", "PH7", "PH8", "PH9", "PH10", "PH11", "PH12", "PH13", "PH14", "PH15", "PH16", "PH17", "PH18", "PH19", "PH20", "PH21", "PH22", "PH23", "PH24", "PH25", "PH26"],
  "PL": ["PL1", "PL2", "PL3", "PL4", "PL5", "PL6", "PL7", "PL8", "PL9", "PL10", "PL11", "PL12", "PL13", "PL14", "PL15", "PL16", "PL17", "PL18", "PL19", "PL20", "PL21", "PL22", "PL23", "PL24", "PL25", "PL26", "PL27", "PL28", "PL29", "PL30", "PL31"],
  "PO": ["PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PO13"],
  "PR": ["PR1", "PR2", "PR3", "PR4", "PR5", "PR6", "PR7", "PR8", "PR9", "PR10", "PR11", "PR12", "PR13", "PR14", "PR15", "PR16", "PR17", "PR18"],
  "RG": ["RG1", "RG2", "RG4", "RG5", "RG6", "RG7", "RG8", "RG9", "RG10", "RG11", "RG12", "RG14", "RG17", "RG18", "RG19", "RG20", "RG21", "RG22", "RG23", "RG24", "RG25", "RG26", "RG27", "RG29"],
  "RH": ["RH1", "RH2", "RH3", "RH4", "RH5", "RH6", "RH7", "RH8", "RH9", "RH10", "RH11", "RH12", "RH13", "RH14"],
  "RM": ["RM1", "RM2", "RM3", "RM4", "RM5", "RM6", "RM7", "RM8", "RM9", "RM10", "RM11", "RM12", "RM13", "RM14", "RM15", "RM16", "RM17", "RM19"],
  "S": ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20", "S21", "S25", "S26", "S60"],
  "SA": ["SA1", "SA2", "SA3", "SA4", "SA5", "SA6", "SA7", "SA8", "SA9", "SA10", "SA11", "SA12", "SA13", "SA14", "SA15", "SA16", "SA17", "SA18", "SA19", "SA20", "SA31", "SA32", "SA33", "SA34", "SA35", "SA36"],
  "SE": ["SE1", "SE2", "SE3", "SE4", "SE5", "SE6", "SE7", "SE8", "SE9", "SE10", "SE11", "SE12", "SE13", "SE14", "SE15", "SE16", "SE17", "SE18", "SE19", "SE20", "SE21", "SE22", "SE23", "SE24", "SE25", "SE26", "SE27", "SE28", "SE29", "SE30"],
  "SG": ["SG1", "SG2", "SG3", "SG4", "SG5", "SG6", "SG7", "SG8", "SG9", "SG10", "SG11", "SG12"],
  "SK": ["SK1", "SK2", "SK3", "SK4", "SK5", "SK6", "SK7", "SK8", "SK9", "SK10", "SK11", "SK12", "SK13", "SK14", "SK15", "SK16", "SK17", "SK18", "SK19", "SK20", "SK21", "SK22", "SK23", "SK24", "SK25", "SK26", "SK27"],
  "SL": ["SL0", "SL1", "SL2", "SL3", "SL4", "SL5", "SL6", "SL7", "SL8", "SL9", "SL10", "SL11", "SL12", "SL13"],
  "SN": ["SN1", "SN2", "SN3", "SN4", "SN5", "SN6", "SN7", "SN8", "SN9", "SN10", "SN11", "SN12", "SN13", "SN14", "SN15", "SN16", "SN25", "SN26"],
  "SO": ["SO14", "SO15", "SO16", "SO17", "SO18", "SO19", "SO20", "SO21", "SO22", "SO23", "SO24", "SO30", "SO31", "SO32", "SO33", "SO34", "SO35", "SO40", "SO41", "SO42", "SO43", "SO45", "SO46", "SO47", "SO48", "SO50", "SO51", "SO52", "SO53", "SO54", "SO55"],
  "SP": ["SP1", "SP2", "SP3", "SP4", "SP5", "SP6", "SP7", "SP8", "SP9", "SP10", "SP11", "SP12"],
  "SR": ["SR1", "SR2", "SR3", "SR4", "SR5", "SR6", "SR7", "SR8"],
  "SS": ["SS0", "SS1", "SS2", "SS3", "SS4", "SS5", "SS6", "SS7", "SS8", "SS9", "SS11", "SS12", "SS13", "SS14", "SS15", "SS16", "SS17", "SS18", "SS99"],
  "ST": ["ST1", "ST2", "ST3", "ST4", "ST5", "ST6", "ST7", "ST8", "ST9", "ST10", "ST11", "ST12", "ST13", "ST14", "ST15", "ST16", "ST17", "ST18", "ST19", "ST20"],
  "SW": ["SW1", "SW2", "SW3", "SW4", "SW5", "SW6", "SW7", "SW8", "SW9", "SW10", "SW11", "SW12", "SW13", "SW14", "SW15", "SW16", "SW17", "SW18", "SW19", "SW20", "SW1A", "SW1E", "SW1H", "SW1P", "SW1V", "SW1W", "SW1X"],
  "SY": ["SY1", "SY2", "SY3", "SY4", "SY5", "SY6", "SY7", "SY8", "SY9", "SY10", "SY11", "SY12", "SY13", "SY14", "SY15", "SY16", "SY17", "SY18", "SY19", "SY20", "SY21", "SY22", "SY23", "SY24", "SY25", "SY26"],
  "TA": ["TA1", "TA2", "TA3", "TA4", "TA5", "TA6", "TA7", "TA8", "TA9", "TA10", "TA11", "TA12", "TA13", "TA14"],
  "TD": ["TD1", "TD2", "TD3", "TD4", "TD5", "TD6", "TD7", "TD8", "TD9", "TD10", "TD11", "TD12", "TD13", "TD14", "TD15", "TD16", "TD17", "TD18"],
  "TF": ["TF1", "TF2", "TF3", "TF4", "TF5", "TF6", "TF7", "TF8", "TF9", "TF10", "TF11", "TF12", "TF13", "TF14", "TF15", "TF16", "TF17", "TF18"],
  "TN": ["TN1", "TN2", "TN3", "TN4", "TN5", "TN6", "TN7", "TN8", "TN9", "TN10", "TN11", "TN12", "TN13", "TN14", "TN15", "TN16", "TN17", "TN18", "TN19", "TN20", "TN21"],
  "TQ": ["TQ1", "TQ2", "TQ3", "TQ4", "TQ5", "TQ6", "TQ7", "TQ8", "TQ9", "TQ10", "TQ11", "TQ12", "TQ13", "TQ14", "TQ15", "TQ16", "TQ17", "TQ18"],
  "TR": ["TR1", "TR2", "TR3", "TR4", "TR5", "TR6", "TR7", "TR8", "TR9", "TR10", "TR11", "TR12", "TR13", "TR14", "TR15", "TR16", "TR17", "TR18"],
  "TS": ["TS1", "TS2", "TS3", "TS4", "TS5", "TS6", "TS7", "TS8", "TS9", "TS10", "TS11", "TS12", "TS13", "TS14", "TS15", "TS16", "TS17", "TS18", "TS19", "TS20", "TS21", "TS22"],
  "TW": ["TW1", "TW2", "TW3", "TW4", "TW5", "TW6", "TW7", "TW8", "TW9", "TW10", "TW11", "TW12", "TW13", "TW14", "TW15", "TW16", "TW17", "TW18", "TW19"],
  "UB": ["UB1", "UB2", "UB3", "UB4", "UB5", "UB6", "UB7", "UB8", "UB9", "UB10", "UB11", "UB12"],
  "W": ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12", "W13", "W14", "W15"],
  "WA": ["WA1", "WA2", "WA3", "WA4", "WA5", "WA6", "WA7", "WA8", "WA9", "WA10", "WA11", "WA12", "WA13", "WA14", "WA15", "WA16", "WA95"],
  "WC": ["WC1A", "WC1B", "WC1E", "WC1H", "WC1N", "WC1R", "WC1V", "WC2A", "WC2B", "WC2E", "WC2H", "WC2N", "WC2R"],
  "WD": ["WD1", "WD2", "WD3", "WD4", "WD5", "WD6", "WD7"],
  "WF": ["WF1", "WF2", "WF3", "WF4", "WF5", "WF6", "WF7", "WF8", "WF9", "WF10"],
  "WN": ["WN1", "WN2", "WN3", "WN4", "WN5", "WN6", "WN7", "WN8", "WN9", "WN10"],
  "WS": ["WS1", "WS2", "WS3", "WS4", "WS5", "WS6", "WS7", "WS8", "WS9", "WS10", "WS11"],
  "WV": ["WV1", "WV2", "WV3", "WV4", "WV5", "WV6", "WV7", "WV8", "WV9", "WV10"],
  "YO": ["YO1", "YO7", "YO8", "YO10", "YO11", "YO12", "YO13", "YO14", "YO15", "YO16", "YO17", "YO18", "YO19", "YO21", "YO22", "YO23", "YO24", "YO25", "YO26", "YO30", "YO31", "YO32", "YO41"],
  "ZE": ["ZE1", "ZE2", "ZE3"]
};

// Map vehicle label -> backend key prefix (kept unchanged)
const VEHICLE_FIELD_KEYS = {
  "SWB Van": "swb_van",
  "MWB Van": "mwb_van",
  "LWB Van": "lwb_van",
  "XLWB Van": "xlwb_van",
  "MWB Luton Van": "mwb_luton_van",
  "LWB Luton Van": "lwb_luton_van",
  "7.5 Tonne Lorry": "tonne_7_5_lorry",
  "12 Tonne Lorry": "tonne_12_lorry",
  "18 Tonne Lorry": "tonne_18_lorry",
};


/* --------------------------------------------------------------------
   CLOUDINARY
-------------------------------------------------------------------- */
import env from "../config/env";

const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = env.CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_UPLOAD_URL = env.CLOUDINARY_UPLOAD_URL;
const CLOUDINARY_FOLDER = env.CLOUDINARY_FOLDER;

/* --------------------------------------------------------------------
   RegisterCompany component - top: state, handlers & helpers
-------------------------------------------------------------------- */
const RegisterCompany = () => {
  const navigate = useNavigate();
  const { register, login, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    contactPerson: "",
    price: "",
    contactNumber: "",
    pincode: "",
    address: "",
    location: "",
    includes: [],
    protection: [],
    materials: [],
    furniture: [],
    appliances: [],
    summary: "",
    galleryFiles: [],
    galleryPreviews: [],
    areasCovered: [],
    vehicles: [],
    loadingPrice: "",
    loadingPerM3: "",
    packingPrice: "",
    packingPerM3: "",
    assemblyPrice: "",
    dismantlePrice: "",
    assemblyPerM3: "",
    // distanceBelow25: "",
    // distanceAbove25: "",
  });

  // UI sections open/close
  const [openSections, setOpenSections] = useState({
    includes: false,
    protection: false,
    materials: false,
    furniture: false,
    appliances: false,
  });

  // areas and selection
  const [areaInput, setAreaInput] = useState("");
  const [activePostcode, setActivePostcode] = useState("");

  // OTP states
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // ---------- FORM CHANGE HANDLER (keeps existing loadingPrice -> per m³ auto-calc)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const arr = prev[name] || [];
        return checked
          ? { ...prev, [name]: [...arr, value] }
          : { ...prev, [name]: arr.filter((v) => v !== value) };
      });
    } else if (name === "loadingPrice") {
      // when loading flat price changes, auto-calc per m³ based on Luton van volume (18m³)
      const clean = value.replace(/[^0-9.]/g, "");
      const amount = parseFloat(clean || "0");
      const LUTON_VOLUME_M3 = 18;
      const perM3 = amount > 0 ? (amount / LUTON_VOLUME_M3).toFixed(0) : "";

      setFormData((prev) => ({
        ...prev,
        loadingPrice: clean,
        loadingPerM3: perM3,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Helper: upload single file to Cloudinary and return secure URL + type
  const uploadFileToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("folder", CLOUDINARY_FOLDER);

    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const json = await res.json();
    return {
      name: file.name,
      url: json.secure_url,
      type: file.type.startsWith("video") ? "video" : "image",
    };
  };

  //  UPLOAD TO CLOUDINARY (NO BLOB URL SENT TO BACKEND)
  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingGallery(true);

    try {
      const uploadedItems = [];
      for (const file of files) {
        try {
          const uploaded = await uploadFileToCloudinary(file);
          uploadedItems.push(uploaded);
        } catch (err) {
          console.error("Cloudinary upload error:", err);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (uploadedItems.length > 0) {
        setFormData((prev) => ({
          ...prev,
          galleryFiles: [...prev.galleryFiles, ...uploadedItems],
          galleryPreviews: [...prev.galleryPreviews, ...uploadedItems],
        }));
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      toast.error("Failed to upload some files.");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  //  REMOVE SINGLE IMAGE/VIDEO FROM GALLERY
  const handleRemoveGalleryItem = (index) => {
    setFormData((prev) => {
      const galleryFiles = [...prev.galleryFiles];
      const galleryPreviews = [...prev.galleryPreviews];

      const preview = galleryPreviews[index];
      if (preview?.url && preview.url.startsWith("blob:")) {
        URL.revokeObjectURL(preview.url);
      }

      galleryFiles.splice(index, 1);
      galleryPreviews.splice(index, 1);

      return { ...prev, galleryFiles, galleryPreviews };
    });
  };

  // area handlers (kept unchanged)
  const handleAreaAdd = () => {
    const code = areaInput.trim();
    if (!code) return;
    if (formData.areasCovered.includes(code)) {
      toast.error("This postcode is already added.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      areasCovered: [...prev.areasCovered, code],
    }));
    setActivePostcode(code);
    setAreaInput("");
  };

  const handleAreaRemove = (code) => {
    setFormData((prev) => ({
      ...prev,
      areasCovered: prev.areasCovered.filter((c) => c !== code),
    }));
    if (activePostcode === code) setActivePostcode("");
  };

  // vehicle handlers (kept)
  const handleVehicleChange = (index, field, value) => {
    setFormData((prev) => {
      const vehicles = [...prev.vehicles];
      const updated = { ...vehicles[index] };

      if (field === "type") {
        const selected = VEHICLE_OPTIONS.find((v) => v.label === value);
        updated.type = value;
        updated.capacity = selected ? selected.capacity : "";
      } else if (field === "quantity") {
        updated.quantity = value.replace(/[^0-9]/g, "");
      } else if (field === "imageUrl") {
        updated.imageUrl = value;
      }

      vehicles[index] = updated;
      return { ...prev, vehicles };
    });
  };

  const handleAddVehicle = () => {
    const first = VEHICLE_OPTIONS[0];
    setFormData((prev) => ({
      ...prev,
      vehicles: [
        ...prev.vehicles,
        {
          type: first.label,
          capacity: first.capacity,
          quantity: "1",
          imageUrl: "",
        },
      ],
    }));
  };

  const handleRemoveVehicle = (index) => {
    setFormData((prev) => {
      const vehicles = [...prev.vehicles];
      vehicles.splice(index, 1);
      return { ...prev, vehicles };
    });
  };

  // assembly/dismantle auto-calc (kept)
  const handleAssemblyChange = (value) => {
    const clean = value.replace(/[^0-9.]/g, "");
    const num = parseFloat(clean || "0");
    const half = (num * 0.5).toFixed(0);
    setFormData((prev) => ({
      ...prev,
      assemblyPrice: clean,
      dismantlePrice: half.toString(),
    }));
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ---------------- OTP: send & verify ----------------
  const handleSendOtp = async () => {
    const phone = formData.contactNumber?.trim();

    // Clean phone number - remove all non-digit characters
    const cleanedPhone = phone?.replace(/\D/g, "") || "";

    // Validate that we have exactly 10 digits
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setSendingOtp(true);

      // Debug: log what we're sending
      console.log("=== OTP REQUEST DEBUG ===");
      console.log("1. Raw phone from form:", formData.contactNumber);
      console.log("2. Cleaned phone:", cleanedPhone);
      console.log("3. Phone length:", cleanedPhone.length);
      console.log("4. Request payload:", { phone: cleanedPhone });
      console.log("5. API Base URL:", env.API_BASE_URL);
      console.log("6. Full URL:", `${env.API_BASE_URL}localmoves.api.auth.send_otp`);

      // Use native fetch instead of axios to avoid Expect header (417 error workaround)
      // Fetch API doesn't automatically add Expect: 100-continue header
      const response = await fetch(`${env.API_BASE_URL}localmoves.api.auth.send_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Explicitly ensure no Expect header
        },
        body: JSON.stringify({ phone: cleanedPhone })
      });

      console.log("7. Response status:", response.status);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("8. OTP Response:", data);
      console.log("=== END DEBUG ===");

      const apiRes = data?.message || data;
      if (!apiRes) {
        toast.error("Unexpected server response.");
        setSendingOtp(false);
        return;
      }
      if (!apiRes.success) {
        toast.error(apiRes.message || "Failed to send OTP.");
        setSendingOtp(false);
        return;
      }

      setOtpStep(true);
      toast.success("OTP sent to your phone.");
    } catch (err) {
      console.error("sendOtp error:", err);
      toast.error(err.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.trim().length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }
    setIsVerified(true);
    toast.success("OTP set. It will be validated during signup.");
  };

  // Helper: auto generate password and (optionally) attempt to email it
  const generatePasswordForPhone = (phone = "") => {
    const p = (phone || "").replace(/\D/g, "");
    const last4 = p.slice(-4) || Math.floor(Math.random() * 9000 + 1000);
    return `LocalMoves@${last4}`;
  };

  // ---------------- SUBMIT: signup (create user) -> login -> create company ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // user must be logged in (previous flow required user); we will create account first
    // Basic validation (kept from original)
    const required = [
      "companyName",
      "companyEmail",
      "contactPerson",
      "contactNumber",
      "pincode",
      "address",
      "location",
    ];
    for (let field of required) {
      if (!formData[field]?.toString().trim()) {
        toast.error(`Please fill in ${field}`);
        return;
      }
    }

    if (!/^\d{10}$/.test(formData.contactNumber)) {
      toast.error("Contact number must be 10 digits");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.companyEmail)) {
      toast.error("Please enter a valid email");
      return;
    }

    const words = formData.summary.trim().split(/\s+/).filter(Boolean);
    if (words.length < 5) {
      toast.error("Summary must be at least 5 words");
      return;
    }

    const checks = ["includes", "protection", "materials", "furniture", "appliances"];
    for (let field of checks) {
      if (formData[field].length < 2) {
        toast.error(`Please select at least 2 items in ${field}`);
        return;
      }
    }

    if (formData.areasCovered.length === 0) {
      toast.error("Please add at least one postcode.");
      return;
    }

    if (formData.vehicles.length === 0) {
      toast.error("Please add at least one vehicle.");
      return;
    }

    if (uploadingGallery) {
      toast.error("Please wait for gallery uploads to finish.");
      return;
    }

    // Validate pricing fields
    const pricingFields = [
      { name: "loadingPrice", label: "Loading Price" },
      { name: "packingPrice", label: "Packing Price" },
      { name: "assemblyPrice", label: "Assembly Price" },
      // { name: "distanceBelow25", label: "Distance < 25 Miles" },
      // { name: "distanceAbove25", label: "Distance > 25 Miles" },
    ];
    for (let field of pricingFields) {
      if (!formData[field.name] || formData[field.name] === "") {
        toast.error(`Please fill in ${field.label}`);
        return;
      }
    }

    if (!otpStep) {
      toast.error("Please send OTP first.");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter OTP.");
      return;
    }

    if (!isVerified) {
      toast.error("Please verify OTP.");
      return;
    }

    // Start full flow
    setLoading(true);

    // 1) Create user account via useAuthStore.register
    const generatedPassword = generatePasswordForPhone(formData.contactNumber);
    const signupPayload = {
      fullName: formData.contactPerson,
      email: formData.companyEmail,
      password: generatedPassword,
      phone: formData.contactNumber,
      otp: otp,
      pincode: formData.pincode,
      city: formData.location,
      state: "", // no state in company form
      userType: "logistic", // forced
    };

    try {
      // call register from store
      const regRes = await register(signupPayload);

      if (!regRes?.success) {
        setLoading(false);
        toast.error(regRes?.message || "Signup failed.");
        return;
      }

      // Send welcome email using the configured email template
      try {
        console.log("=== SENDING WELCOME EMAIL ===");
        console.log("Recipient:", formData.companyEmail);
        console.log("User name:", formData.contactPerson);
        console.log("Password:", generatedPassword);

        // Use the signup verification email endpoint that uses the template
        const emailRes = await api.post("localmoves.api.auth.send_signup_verification_email", {
          user_name: formData.contactPerson,
          user_email: formData.companyEmail,
          phone: formData.contactNumber,
          password: generatedPassword,
        });

        console.log("Email sent successfully:", emailRes.data);
        toast.success("Welcome email sent to " + formData.companyEmail);
      } catch (emailErr) {
        console.error("=== WELCOME EMAIL FAILED ===");
        console.error("Error:", emailErr);
        console.error("Error response:", emailErr.response?.data);
        console.error("Error status:", emailErr.response?.status);

        // Show different messages based on error type
        if (emailErr.response?.status === 404) {
          toast.warning("Email service not configured. Please save this password: " + generatedPassword);
        } else if (emailErr.response?.status === 500) {
          toast.error("Failed to send welcome email. Password: " + generatedPassword);
        } else {
          toast.info("Account created successfully. Password: " + generatedPassword);
        }
      }

      // 2) Login newly created account to obtain token (so create_company call will be authenticated)
      const loginRes = await login(formData.companyEmail, generatedPassword);

      // login returns object; check success
      if (!loginRes?.success) {
        // login failed, but signup succeeded — still try to create company (may work unauthenticated depending on backend)
        toast.info("Signup successful but auto-login failed. Attempting to register company without authentication.");
      }

      // 3) Build vehicle payloads (existing logic)
      const vehicleQuantityPayload = {
        swb_van_quantity: 0,
        mwb_van_quantity: 0,
        lwb_van_quantity: 0,
        xlwb_van_quantity: 0,
        mwb_luton_van_quantity: 0,
        lwb_luton_van_quantity: 0,
        tonne_7_5_lorry_quantity: 0,
        tonne_12_lorry_quantity: 0,
        tonne_18_lorry_quantity: 0,
      };

      const vehicleImagesPayload = {
        swb_van_images: [],
        mwb_van_images: [],
        lwb_van_images: [],
        xlwb_van_images: [],
        mwb_luton_van_images: [],
        lwb_luton_van_images: [],
        tonne_7_5_lorry_images: [],
        tonne_12_lorry_images: [],
        tonne_18_lorry_images: [],
      };

      formData.vehicles.forEach((v) => {
        const baseKey = VEHICLE_FIELD_KEYS[v.type];
        if (!baseKey) return;

        const qtyKey = `${baseKey}_quantity`;
        const imgKey = `${baseKey}_images`;

        const qtyNum = Number(v.quantity) || 0;

        if (Object.prototype.hasOwnProperty.call(vehicleQuantityPayload, qtyKey)) {
          vehicleQuantityPayload[qtyKey] += qtyNum;
        } else {
          vehicleQuantityPayload[qtyKey] = qtyNum;
        }

        if (v.imageUrl) {
          if (!vehicleImagesPayload[imgKey]) {
            vehicleImagesPayload[imgKey] = [];
          }
          vehicleImagesPayload[imgKey].push(v.imageUrl);
        }
      });

      const galleryUrls =
        formData.galleryPreviews.length > 0
          ? formData.galleryPreviews.map((item) => item.url)
          : [];

      const servicesOffered =
        formData.includes && formData.includes.length > 0
          ? formData.includes.join(", ")
          : "Packing, Loading, Transport";

      const companyPayload = {
        company_name: formData.companyName,
        company_email: formData.companyEmail,
        phone: formData.contactNumber,
        pincode: formData.pincode,
        location: formData.location,
        address: formData.address,
        description: formData.summary,
        services_offered: servicesOffered,
        personal_contact_name: formData.contactPerson,

        areas_covered: formData.areasCovered,
        company_gallery: galleryUrls,

        includes: formData.includes,
        material: formData.materials,
        protection: formData.protection,
        furniture: formData.furniture,
        appliances: formData.appliances,

        ...vehicleQuantityPayload,
        ...vehicleImagesPayload,

        loading_cost_per_m3: Number(formData.loadingPerM3 || 0),
        packing_cost_per_box: Number(formData.packingPrice || 0),
        assembly_cost_per_item: Number(formData.assemblyPrice || 0),
        disassembly_cost_per_item: Number(formData.dismantlePrice || 0),
        // cost_per_mile_under_25: Number(formData.distanceBelow25 || 0),
        // cost_per_mile_over_25: Number(formData.distanceAbove25 || 0),
      };

      // 4) Create company using existing API (unchanged)
      try {
        const res = await api.post("localmoves.api.company.create_company", companyPayload);

        const resMsg = res.data?.message || res.data;
        if (resMsg?.success) {
          toast.success("Company registered successfully!");

          // Update user locally to reflect company registration — best-effort update
          try {
            const stored = JSON.parse(localStorage.getItem("user") || "null") || {};
            const updatedUser = {
              ...stored,
              company_registered: true,
              company_name: formData.companyName,
              subscription_plan: stored.subscription_plan || "Free",
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            updateUser({ company_registered: true, company_name: formData.companyName });
            window.dispatchEvent(new Event("subscription-updated"));
          } catch {
            // ignore local update failures
          }

          setLoading(false);
          navigate("/onboarding-subscription", { replace: true });
          return;
        } else {
          // company creation failed; show message (but signup succeeded)
          setLoading(false);
          toast.error(resMsg?.message || "Company registration failed.");
          return;
        }
      } catch (cErr) {
        console.error("create_company error:", cErr);
        setLoading(false);
        toast.error("Failed to register company. Signup succeeded.");
        return;
      }
    } catch (err) {
      console.error("Full signup+company flow error:", err);
      setLoading(false);
      toast.error("Server error. Try again later.");
      return;
    }
  };

  const sectionsData = [
    {
      key: "includes",
      label: "Includes",
      icon: <FaClipboardList className="text-pink-600" />,
      options: [
        "Starts",
        "Pay In Instalments",
        "Vehicle Tracking",
        "Insurance Cover £5000",
        "Instant Online Quotes",
        "24/7 Customer Support",
        "Live Move Updates",
      ],
    },
    {
      key: "protection",
      label: "Protection",
      icon: <FaBoxes className="text-pink-600" />,
      options: [
        "Protection of fragile items",
        "Wrapping of furniture",
        "Softs & mattresses",
        "Boxing up contents",
      ],
    },
    {
      key: "materials",
      label: "Materials",
      icon: <FaMoneyBillWave className="text-pink-600" />,
      options: [
        "Eco-friendly boxes",
        "Reusable wrapping materials",
        "Labeling services",
      ],
    },
    {
      key: "furniture",
      label: "Furniture",
      icon: <FaCouch className="text-pink-600" />,
      options: [
        "Dismantling & reassembly",
        "Furniture storage options",
      ],
    },
    {
      key: "appliances",
      label: "Appliances",
      icon: <FaTv className="text-pink-600" />,
      options: [
        "Washing Machines",
        "Dishwashers",
        "Fridges & Freezers",
      ],
    },
  ];

  const mapLocation =
    activePostcode || formData.pincode || "London, United Kingdom";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-3 sm:p-4 md:p-6 gap-4 sm:gap-6 bg-gray-50 text-gray-900">
      <style>{selectOptionsStyle}</style>

      {/* LEFT FORM */}
      <div className="lg:w-2/3 w-full flex justify-center items-start">
        <div className="w-full max-w-2xl rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10 hover:shadow-xl transition-all border border-pink-100 bg-white">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 text-pink-600">
            <HiOutlineBuildingStorefront /> Register Company & Services
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* COMPANY NAME */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium flex items-center gap-1 text-pink-600">
                  <FaBuilding /> Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className="w-full border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                  required
                />
              </div>

              {/* COMPANY EMAIL */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium flex items-center gap-1 text-pink-600">
                  <FaEnvelope /> Company Email *
                </label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                  required
                />
              </div>

              {/* CONTACT PERSON */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium flex items-center gap-1 text-pink-600">
                  <FaUser /> Personal Contact Name *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  className="w-full border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                  required
                />
              </div>

              {/* PHONE */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium flex items-center gap-1 text-pink-600">
                  <FaPhoneAlt /> Phone *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      // Only allow digits
                      const cleaned = e.target.value.replace(/\D/g, "");
                      // Limit to 10 digits
                      const limited = cleaned.slice(0, 10);
                      handleChange({ target: { name: "contactNumber", value: limited } });
                    }}
                    placeholder="10-digit phone number"
                    className="w-full border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                    required
                  />
                  {!isVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || otpStep}
                      className={`px-3 py-2 rounded-lg text-white ${otpStep ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
                        }`}
                    >
                      {otpStep ? "Sent" : sendingOtp ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <span className="bg-pink-600 text-white px-3 py-2 rounded-lg flex items-center gap-1">
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                </div>

                {otpStep && !isVerified && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-4 py-2 border rounded-lg text-pink-600 border-pink-500 hover:bg-pink-50"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              {/* POSTCODE */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium flex items-center gap-1 text-pink-600">
                  <FaMapMarkerAlt /> Company Postcode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={(e) => {
                    handleChange(e);
                    if (!activePostcode) setActivePostcode(e.target.value);
                  }}
                  placeholder="e.g. SW1A 1AA"
                  className="w-full border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                  required
                />
              </div>

              {/* ADDRESS */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium flex items-center gap-1 text-pink-600">
                  <FaLocationArrow /> Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                  required
                />
              </div>

              {/* CITY */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-pink-600">
                  City / Town *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. London"
                  className="w-full border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                  required
                />
              </div>

              {/* BASE PRICE — HIDDEN FROM UI BUT STILL REQUIRED BY BACKEND */}
              <input
                type="hidden"
                name="price"
                value={formData.price}
                onChange={handleChange}
              />

            </div>

            {/* GALLERY */}
            <div className="border rounded-2xl p-4 space-y-3 border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold flex items-center gap-2 text-pink-600">
                  <FaImages /> Gallery (pics & videos)
                </span>
                <span className="text-xs text-gray-500">
                  Show your vehicles, team & moves (optional)
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Upload photos/videos that represent your company professionally.
              </p>

              {/* Pink upload button */}
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm cursor-pointer bg-pink-600 hover:bg-pink-700 disabled:opacity-50">
                <FaImages />
                <span>{uploadingGallery ? "Uploading..." : "Choose files"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleGalleryChange}
                  className="hidden"
                  disabled={uploadingGallery}
                />
              </label>

              {formData.galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-2">
                  {formData.galleryPreviews.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative w-full aspect-video rounded-md overflow-hidden border border-gray-200 bg-gray-100"
                    >
                      {/* Remove item */}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-black/80"
                      >
                        ×
                      </button>

                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[10px] flex items-center justify-center h-full px-2 text-gray-700">
                          Video: {item.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AREAS COVERED */}
            <div className="border rounded-2xl p-4 space-y-4 border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold flex items-center gap-2 text-pink-600">
                  <FaMapMarkerAlt /> Areas Covered (postcodes)
                </span>
                <span className="text-xs text-gray-500">
                  Used to allocate jobs to you
                </span>
              </div>

              <select
                value={activePostcode}
                onChange={(e) => {
                  setActivePostcode(e.target.value);
                  setAreaInput("");
                }}
                className="w-full border rounded-lg px-4 py-2 text-sm bg-white text-gray-900 border-gray-300 focus:border-pink-500"
              >
                <option value="">Select Postcode Prefix</option>
                {Object.keys(POSTCODE_DISTRICTS).map((prefix) => (
                  <option key={prefix} value={prefix}>{prefix}</option>
                ))}
              </select>


              {activePostcode && POSTCODE_DISTRICTS[activePostcode] && (
                <select
                  value=""
                  onChange={(e) => {
                    const district = e.target.value;

                    if (!formData.areasCovered.includes(district)) {
                      setFormData((prev) => ({
                        ...prev,
                        areasCovered: [...prev.areasCovered, district],
                      }));
                    }

                    setActivePostcode(district);
                    setAreaInput("");
                  }}
                  className="w-full border rounded-lg px-4 py-2 text-sm bg-white text-gray-900 border-gray-300 focus:border-pink-500 mt-2"
                >
                  <option value="">Select District</option>
                  {POSTCODE_DISTRICTS[activePostcode].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="Enter postcode e.g. E1 6AN"
                  className="flex-1 border rounded-lg px-4 py-2 text-sm border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={handleAreaAdd}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm whitespace-nowrap bg-pink-600 hover:bg-pink-700"
                >
                  <FaPlus /> Add
                </button>
              </div>

              {formData.areasCovered.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.areasCovered.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setActivePostcode(code)}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border transition ${activePostcode === code
                        ? "bg-pink-100 border-pink-500 text-pink-700"
                        : "bg-gray-100 border-gray-300 text-gray-700"
                        }`}
                    >
                      <span>{code}</span>
                      <FaTimes
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAreaRemove(code);
                        }}
                        className="cursor-pointer"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2">
                <iframe
                  title="Company Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    mapLocation
                  )}&output=embed`}
                  width="100%"
                  height="250"
                  loading="lazy"
                  allowFullScreen
                  className="rounded-xl border w-full border-gray-300"
                ></iframe>
              </div>
            </div>

            {/* VEHICLES */}
            <div className="border rounded-2xl p-4 space-y-4 border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold flex items-center gap-2 text-pink-600">
                  <FaTruck /> Add Vehicle(s)
                </span>
                <span className="text-xs text-right text-gray-500">
                  Helps determine what jobs you can handle
                </span>
              </div>

              <div className="space-y-3">
                {formData.vehicles.map((v, idx) => (
                  <div
                    key={idx}
                    className="border rounded-xl p-3 grid grid-cols-1 md:grid-cols-3 gap-3 border-gray-200 bg-white"
                  >
                    {/* SIZE */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1 text-gray-700">
                        Size *
                      </label>
                      <CustomSelect
                        value={v.type}
                        onChange={(value) =>
                          handleVehicleChange(idx, "type", value)
                        }
                        options={VEHICLE_OPTIONS}
                        placeholder="Select vehicle size"
                        required
                      />
                    </div>

                    {/* CAPACITY */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1 text-gray-700">
                        Approx Capacity (m³)
                      </label>
                      <input
                        type="number"
                        value={v.capacity}
                        readOnly
                        className="border rounded-lg px-3 py-2 text-sm border-gray-300 bg-gray-50 text-gray-700"
                      />
                    </div>

                    {/* QUANTITY */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium mb-1 text-gray-700">
                        Quantity Owned *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={v.quantity}
                        onChange={(e) =>
                          handleVehicleChange(idx, "quantity", e.target.value)
                        }
                        className="border rounded-lg px-3 py-2 text-sm border-gray-300 bg-white text-gray-900"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVehicle(idx)}
                      className="mt-2 text-xs text-red-500 hover:underline md:col-span-3 text-left"
                    >
                      Remove Vehicle
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
                >
                  <FaPlus /> Add Vehicle
                </button>
              </div>
            </div>

            {/* SET YOUR RATES */}
            <div className="border rounded-2xl p-6 space-y-6 border-gray-200 bg-gradient-to-br from-pink-50 to-white shadow-sm">

              {/* Section Title */}
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-semibold flex items-center gap-2 text-pink-700 text-lg">
                  <FaMoneyBillWave className="text-pink-600" /> Set Your Rates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* LOADING */}
                <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <h4 className="font-semibold text-sm text-pink-700 leading-relaxed">
                    Loading – Approx how much would you charge to load a Luton Van?
                  </h4>
                  <p className="text-xs text-gray-500 italic mt-1">
                    (Recommended range £400 – £700)
                  </p>

                  <input
                    type="number"
                    name="loadingPrice"
                    value={formData.loadingPrice}
                    onChange={handleChange}
                    className="w-full mt-3 border rounded-lg px-4 py-2.5 text-sm border-gray-300 bg-white text-gray-900 
                   focus:ring-2 focus:ring-pink-300 focus:border-pink-500 transition-all"
                    placeholder="Enter your loading rate"
                    required
                  />

                  <input type="hidden" name="loadingPerM3" value={formData.loadingPerM3} />
                </div>

                {/* PACKING */}
                <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <h4 className="font-semibold text-sm text-pink-700 leading-relaxed">
                    Packing – How much to pack 15 boxes?
                  </h4>

                  <input
                    type="number"
                    name="packingPrice"
                    value={formData.packingPrice}
                    onChange={handleChange}
                    className="w-full mt-3 border rounded-lg px-4 py-2.5 text-sm border-gray-300 bg-white text-gray-900 
                   focus:ring-2 focus:ring-pink-300 focus:border-pink-500 transition-all"
                    placeholder="Enter your packing rate"
                    required
                  />

                  <input type="hidden" name="packingPerM3" value={formData.packingPerM3} />
                </div>

                {/* FURNITURE ASSEMBLY */}
                <div className="rounded-xl p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 md:col-span-2">
                  <h4 className="font-semibold text-sm text-pink-700 leading-relaxed">
                    Furniture Assembly – How much to assemble a wardrobe?
                  </h4>

                  <div className="flex flex-col sm:flex-row gap-4 mt-3">

                    {/* Assembly */}
                    <div className="flex flex-col flex-1">
                      <label className="text-xs text-gray-600 mb-1 font-medium">Assembly Price (£)</label>
                      <input
                        type="number"
                        name="assemblyPrice"
                        value={formData.assemblyPrice}
                        onChange={(e) => handleAssemblyChange(e.target.value)}
                        className="border rounded-lg px-4 py-2.5 text-sm border-gray-300 bg-white text-gray-900 
                       focus:ring-2 focus:ring-pink-300 focus:border-pink-500 transition-all"
                        placeholder="Enter assembly charge"
                        required
                      />
                    </div>

                    {/* Dismantling */}
                    <div className="flex flex-col flex-1">
                      <label className="text-xs text-gray-600 mb-1 font-medium">Dismantling Price (£)</label>
                      <input
                        type="number"
                        name="dismantlePrice"
                        value={formData.dismantlePrice}
                        readOnly
                        className="border rounded-lg px-4 py-2.5 text-sm border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                  </div>

                  <input type="hidden" name="assemblyPerM3" value={formData.assemblyPerM3} />
                </div>

              </div>
            </div>


            {/* DISTANCE COST
            <div className="border rounded-2xl p-4 space-y-4 border-gray-200 bg-gray-50 mt-4">
              <h4 className="font-semibold text-sm text-pink-600 flex items-center gap-2">
                <FaMoneyBillWave className="w-4 h-4" /> Distance Cost (Per Mile)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BELOW 25 MILES */}
            {/* <div className="border rounded-xl p-3 space-y-2 border-gray-200 bg-white">
                  <h5 className="text-xs font-medium text-gray-700">
                    Distance &lt; 25 Miles
                  </h5>

                  <div className="flex items-center gap-2">
                    <span className="text-xs w-32 text-gray-600">Cost Per Mile (£)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="distanceBelow25"
                      value={formData.distanceBelow25}
                      onChange={handleChange}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-sm border-gray-300 bg-white text-gray-900"
                      placeholder="0.20"
                      required
                    />
                  </div>
                </div> */}

            {/* ABOVE 25 MILES */}
            {/* <div className="border rounded-xl p-3 space-y-2 border-gray-200 bg-white">
                  <h5 className="text-xs font-medium text-gray-700">
                    Distance &gt; 25 Miles
                  </h5>

                  <div className="flex items-center gap-2">
                    <span className="text-xs w-32 text-gray-600">Cost Per Mile (£)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="distanceAbove25"
                      value={formData.distanceAbove25}
                      onChange={handleChange}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-sm border-gray-300 bg-white text-gray-900"
                      placeholder="0.30"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>  */}

            {/* CHECKBOXES + SUMMARY */}
            <div className="border rounded-2xl overflow-hidden shadow-sm border-gray-200 bg-white">
              {sectionsData.map((sec, idx) => (
                <CheckboxGroup
                  key={sec.key}
                  title={sec.label}
                  icon={sec.icon}
                  name={sec.key}
                  options={sec.options}
                  formData={formData}
                  handleChange={handleChange}
                  isOpen={openSections[sec.key]}
                  toggleOpen={() => toggleSection(sec.key)}
                  noBorder={idx === 0}
                />
              ))}

              {/* SUMMARY */}
              <div className="border-t p-4 border-gray-200">
                <label className="font-semibold mb-2 flex items-center gap-2 text-pink-600">
                  <FaStar /> Company Summary
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Short introduction to your company"
                  className="w-full border rounded-lg px-4 py-2 text-sm resize-none border-gray-300 bg-white text-gray-900 focus:border-pink-500"
                ></textarea>
              </div>
            </div>

            {/* SUBMIT */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading || uploadingGallery}
                className="w-full sm:w-auto text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition font-semibold text-base sm:text-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {loading
                  ? "Registering..."
                  : uploadingGallery
                    ? "Please wait..."
                    : "Register Company"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT PREVIEW - Sticky on desktop */}
      <div className="lg:w-1/3 w-full hidden lg:block lg:sticky lg:top-6 self-start">
        <div className="p-4 sm:p-6 border rounded-3xl shadow-lg space-y-4 border-gray-200 bg-white">

          {/* COMPANY NAME */}
          <h3 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-pink-600">
            <FaBuilding /> {formData.companyName || "Your Company Name"}
          </h3>

          {/* BASIC INFO PREVIEW */}
          <div className="space-y-1 text-sm text-gray-700">
            <p className="flex items-center gap-2 text-xs sm:text-sm break-all">
              <FaEnvelope /> {formData.companyEmail || "Company Email"}
            </p>
            <p className="flex items-center gap-2 text-xs sm:text-sm break-all">
              <FaUser /> {formData.contactPerson || "Contact Person"}
            </p>
            <p className="flex items-center gap-2 text-xs sm:text-sm break-all">
              <FaPhoneAlt /> {formData.contactNumber || "Phone"}
            </p>
            <p className="flex items-center gap-2 text-xs sm:text-sm break-all">
              <FaMapMarkerAlt /> {formData.address || "Address"},{" "}
              {formData.location || "City"}, {formData.pincode || "Postcode"}
            </p>
          </div>

          {/* AREAS PREVIEW */}
          {formData.areasCovered.length > 0 && (
            <div className="pt-2 space-y-1">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-pink-600">
                <FaMapMarkerAlt /> Areas Covered
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.areasCovered.map((code) => (
                  <span
                    key={code}
                    className="px-2 py-1 rounded-full text-xs border bg-pink-50 text-pink-700 border-pink-200"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY PREVIEW */}
          {formData.galleryPreviews.length > 0 && (
            <div className="pt-2 space-y-1">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-pink-600">
                <FaImages /> Gallery Preview
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {formData.galleryPreviews.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-full aspect-video rounded-md overflow-hidden border border-gray-200 bg-gray-100"
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[10px] flex items-center justify-center h-full px-2 text-gray-700">
                        Video: {item.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {formData.galleryPreviews.length > 3 && (
                <p className="text-[11px] text-gray-500">
                  +{formData.galleryPreviews.length - 3} more media items
                </p>
              )}
            </div>
          )}

          {/* VEHICLE PREVIEW */}
          {formData.vehicles.length > 0 && (
            <div className="pt-3 space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-pink-600">
                <FaTruck /> Fleet Overview
              </h4>

              <div className="border rounded-xl overflow-hidden text-xs border-gray-200 bg-white">
                <div className="grid grid-cols-3 px-3 py-2 font-semibold bg-gray-50 text-gray-700">
                  <span>Size</span>
                  <span className="text-center">Capacity</span>
                  <span className="text-center">Qty</span>
                </div>

                <div className="divide-y divide-gray-200">
                  {formData.vehicles.map((v, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 px-3 py-1.5 text-gray-800"
                    >
                      <span className="pr-2 truncate text-xs">
                        {VEHICLE_OPTIONS.find((o) => o.label === v.type)?.icon}{" "}
                        {v.type}
                      </span>
                      <span className="text-center text-xs">{v.capacity}</span>
                      <span className="text-center text-xs">{v.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RATES PREVIEW */}
          <div className="pt-3 space-y-2 text-xs text-gray-700">
            <h4 className="font-semibold flex items-center gap-2 text-sm text-pink-600">
              <FaMoneyBillWave /> Rates Snapshot
            </h4>

            <p>
              <span className="font-semibold">Loading:</span> £
              {formData.loadingPrice}
              <span className="text-gray-500"> </span>
            </p>

            <p>
              <span className="font-semibold">Packing:</span> £
              {formData.packingPrice}
            </p>

            <p>
              <span className="font-semibold">Assembly:</span> £
              {formData.assemblyPrice}
            </p>

            <p>
              <span className="font-semibold">Dismantling:</span> £
              {formData.dismantlePrice}
            </p>

            <p>
              <span className="font-semibold">Distance &lt; 25 Miles:</span> £
              {formData.distanceBelow25}/mile
            </p>

            <p>
              <span className="font-semibold">Distance &gt; 25 Miles:</span> £
              {formData.distanceAbove25}/mile
            </p>
          </div>

          {/* CHECKBOX SECTIONS PREVIEW */}
          <div className="pt-3 space-y-2">
            {sectionsData.map((sec) =>
              formData[sec.key]?.length > 0 ? (
                <div key={sec.key}>
                  <h4 className="font-semibold flex items-center gap-2 text-sm text-pink-600">
                    <FaListUl /> {sec.label}
                  </h4>
                  <ul className="list-disc pl-5 text-xs space-y-0.5 text-gray-700">
                    {formData[sec.key].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}

            {/* SUMMARY PREVIEW */}
            {formData.summary.trim() && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 text-sm text-pink-600">
                  <FaStar /> Summary
                </h4>
                <p className="text-sm whitespace-pre-line text-gray-700">
                  {formData.summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;
